import { NextAuthOptions, getServerSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import { Role } from "./types"
import bcrypt from "bcryptjs"

// Simple email transport for development
const sendVerificationRequest = async ({ identifier: email, url }: any) => {
  // Magic link generated for ${email}
  // In development, just log the magic link to console
}

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

// Demo-accounts die zonder 2FA mogen inloggen (alleen voor testen/delen)
const demoAccounts = new Set(
  ['jan.vermeersch@example.com', 'sarah.janssens@example.com'].map((email) =>
    email.toLowerCase()
  )
)

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
        otp: { label: "Bevestigingscode", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email en wachtwoord zijn verplicht")
        }

        const email = credentials.email.toLowerCase()
        const isDemo = demoAccounts.has(email)

        if (!credentials?.otp && !isDemo) {
          throw new Error("Voer de beveiligingscode in")
        }

        const user = await db.user.findUnique({
          where: { email }
        })

        if (!user || !user.password) {
          throw new Error("Ongeldige inloggegevens")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Ongeldige inloggegevens")
        }

        if (!isDemo) {
          const verificationRecord = await db.verificationToken.findFirst({
            where: {
              identifier: `2fa:${user.id}`,
              expires: { gt: new Date() }
            }
          })

          if (!verificationRecord) {
            throw new Error("Geen geldige bevestigingscode gevonden")
          }

          const isOtpValid = await bcrypt.compare(
            credentials.otp,
            verificationRecord.token
          )

          if (!isOtpValid) {
            throw new Error("De code is ongeldig of verlopen")
          }

          await db.verificationToken.deleteMany({
            where: { identifier: `2fa:${user.id}` }
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          image: user.image,
        }
      }
    }),
    EmailProvider({
      server: "smtp://localhost:587",
      from: "noreply@tailtribe.be",
      sendVerificationRequest,
    }),
]

if (googleClientId && googleClientSecret) {
  providers.unshift(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  providers,
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role
      }
      
      // If session update triggered, refetch user role
      if (trigger === 'update') {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true }
        })
        if (dbUser) {
          token.role = dbUser.role as Role
        }

      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as Role
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) {
          return '/auth/signin?error=REGISTER_FIRST'
        }

        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { password: true, email: true }
        })

        if (!dbUser?.password) {
          await db.account.deleteMany({ where: { userId: user.id } })
          await db.user.delete({ where: { id: user.id } })
          const email = user.email || dbUser?.email
          const emailQuery = email ? `&email=${encodeURIComponent(email)}` : ''
          return `/auth/signin?error=REGISTER_FIRST${emailQuery}`
        }
      }

      return true
    },
    async redirect({ url, baseUrl }) {
      // After Google sign-in, check if user needs role selection
      if (url.startsWith(baseUrl)) {
        return url
      }
      // If external URL, return to base
      return baseUrl
    },
  },
  events: {
    async createUser({ user }) {
      // Log user creation
      console.log(`New user created: ${user.email}`)
      // Note: New users from Google will have role = null
      // They need to go through role selection flow
    },
  },
}

declare module "next-auth" {
  interface User {
    role: Role
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: Role
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
  }
}

// Helper function to get current session
export const auth = () => getServerSession(authOptions)


