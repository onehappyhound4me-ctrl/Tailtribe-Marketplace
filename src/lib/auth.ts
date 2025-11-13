import { NextAuthOptions, getServerSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
// import EmailProvider from "next-auth/providers/email" // Disabled - causes build errors with nodemailer
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

// NextAuth will automatically construct the redirect URI from NEXTAUTH_URL
// No need for manual redirect URI configuration

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  debug: process.env.NODE_ENV === 'development',
  // Force base URL to match production domain
  ...(process.env.NEXTAUTH_URL && {
    baseUrl: process.env.NEXTAUTH_URL.replace(/\/$/, '')
  }),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Wachtwoord", type: "password" }
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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          image: user.image,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        }
      }
    }),
    // EmailProvider disabled - causes build errors with nodemailer fs dependency
    // EmailProvider({
    //   server: "smtp://localhost:587",
    //   from: "noreply@tailtribe.be",
    //   sendVerificationRequest,
    // }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    verifyRequest: '/auth/verify-request',
    error: '/auth/signin',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? true,
        // Don't set domain - let browser handle it automatically
        // This prevents cookie issues with www vs non-www
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user) {
        // For Google OAuth, fetch user from database first
        if (account?.provider === 'google' && user.email) {
          const dbUser = await db.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true, email: true }
          })
          
          console.log('[AUTH] JWT - Google OAuth initial:', { email: user.email, dbUser: dbUser?.id, role: dbUser?.role })
          
          if (dbUser) {
            token.role = (dbUser.role as Role) || 'OWNER'
            token.id = dbUser.id
            token.sub = dbUser.id
            token.email = dbUser.email
            console.log('[AUTH] JWT - Google OAuth token set:', { userId: dbUser.id, role: token.role, sub: token.sub })
          } else {
            // Fallback if user not found (shouldn't happen due to signIn callback)
            token.role = 'OWNER'
            token.id = user.id
            token.sub = user.id
            console.log('[AUTH] JWT - Google OAuth fallback:', { userId: user.id, role: token.role })
          }
        } else {
          // For credentials provider
          const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: { id: true, role: true, email: true }
          })
          
          if (dbUser) {
            token.role = (dbUser.role as Role) || 'OWNER'
            token.id = dbUser.id
            token.sub = dbUser.id
            console.log('[AUTH] JWT - Credentials sign in:', { userId: dbUser.id, email: dbUser.email, role: token.role })
          } else {
            token.role = (user.role as Role) || 'OWNER'
            token.id = user.id
            token.sub = user.id
            console.log('[AUTH] JWT - Credentials fallback:', { userId: user.id, role: token.role })
          }
        }
      }
      
      // If session update triggered, refetch user role
      if (trigger === 'update' && token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true }
        })
        if (dbUser) {
          token.role = (dbUser.role as Role) || 'OWNER'
          console.log('[AUTH] JWT - session update:', { userId: token.sub, role: token.role })
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub
        session.user.role = (token.role as Role) || 'OWNER'
        console.log('[AUTH] Session callback:', { 
          userId: session.user.id, 
          email: session.user.email, 
          role: session.user.role,
          tokenRole: token.role,
          tokenSub: token.sub
        })
      } else {
        console.error('[AUTH] Session callback - no token or token.sub!', { hasToken: !!token, tokenSub: token?.sub })
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // For Google OAuth, allow login if user already exists (account linking)
      if (account?.provider === 'google' && user.email && account.providerAccountId) {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
            include: {
              accounts: {
                where: { provider: 'google' }
              }
            }
          })
          
          console.log('[AUTH] Google signIn - existingUser:', existingUser?.id, existingUser?.role, 'email:', user.email, 'hasGoogleAccount:', existingUser?.accounts?.length > 0)
          
          // Block login if user doesn't exist - they must register first
          if (!existingUser) {
            console.log('[AUTH] Google signIn - user not found, blocking login for:', user.email)
            return false
          }
          
          // If user exists but doesn't have Google account linked, link it now
          if (existingUser && existingUser.accounts.length === 0) {
            console.log('[AUTH] Google signIn - linking Google account to existing user:', existingUser.id)
            await db.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              }
            })
            console.log('[AUTH] Google signIn - account linked successfully')
          }
          
          // Allow login - user exists and account is now linked
          console.log('[AUTH] Google signIn - allowing login for existing user')
          return true
        } catch (error: any) {
          console.error('[AUTH] Error in signIn callback:', error)
          // Block sign-in on any error
          return false
        }
      }
      
      // Allow credentials provider to proceed
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('[AUTH] Redirect callback:', { url, baseUrl, NEXTAUTH_URL: process.env.NEXTAUTH_URL })
      
      // Allow relative URLs (e.g. "/dashboard")
      if (url.startsWith('/')) {
        const redirectUrl = `${baseUrl}${url}`
        console.log('[AUTH] Redirect to (relative):', redirectUrl)
        return redirectUrl
      }
      
      // Allow same-origin absolute URLs
      try {
        const urlObj = new URL(url)
        if (urlObj.origin === baseUrl) {
          console.log('[AUTH] Redirect to (same origin):', url)
          return url
        }
      } catch (e) {
        // Ignore parsing errors and fallback below
        console.log('[AUTH] URL parsing failed:', e)
      }
      
      // Default for sign-in: send users to the main dashboard
      // Never redirect back to /login or /auth/signin for authenticated users
      const dashboardUrl = `${baseUrl}/dashboard`
      console.log('[AUTH] Redirect to dashboard (default):', dashboardUrl)
      return dashboardUrl
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
