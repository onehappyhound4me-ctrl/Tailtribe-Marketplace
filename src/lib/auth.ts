import { NextAuthOptions, getServerSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import EmailProvider from "next-auth/providers/email"
// import GoogleProvider from "next-auth/providers/google" // Temporarily disabled
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import { Role } from "./types"
import bcrypt from "bcryptjs"
import { verifyTwoFactorCode } from "./twoFactor"

// Simple email transport for development
const sendVerificationRequest = async ({ identifier: email, url }: any) => {
  // Magic link generated for ${email}
  // In development, just log the magic link to console
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
        twoFactorCode: { label: "2FA code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email en wachtwoord zijn verplicht")
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
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

        if (!credentials.twoFactorCode) {
          throw new Error("TWO_FACTOR_REQUIRED")
        }

        const isTwoFactorValid = await verifyTwoFactorCode(
          user.id,
          credentials.twoFactorCode
        )

        if (!isTwoFactorValid) {
          throw new Error("TWO_FACTOR_INVALID")
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
    // GoogleProvider - Temporarily disabled (will enable when site goes live)
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID || "",
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    // }),
    EmailProvider({
      server: "smtp://localhost:587",
      from: "noreply@tailtribe.be",
      sendVerificationRequest,
    }),
  ],
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
          token.role = dbUser.role
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
    async signIn({ user, account, profile, email, credentials }) {
      // Allow all sign-ins
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


