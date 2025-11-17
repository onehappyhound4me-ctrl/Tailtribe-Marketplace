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
        console.log('[AUTH] Credentials authorize called')
        console.log('[AUTH] Email:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing email or password')
          return null // Return null instead of throwing - NextAuth expects this
        }

        console.log('[AUTH] Looking up user in database...')
        const user = await db.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          console.log('[AUTH] User not found:', credentials.email)
          return null
        }

        if (!user.password) {
          console.log('[AUTH] User found but no password set:', credentials.email)
          return null
        }

        console.log('[AUTH] User found, checking password...')
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          console.log('[AUTH] Password invalid for:', credentials.email)
          return null
        }

        console.log('[AUTH] Password valid, returning user object')
        console.log('[AUTH] User role:', user.role)
        
        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
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
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user) {
        console.log('[AUTH] JWT callback - user present, provider:', account?.provider)
        
        // For Google OAuth, fetch user from database first
        if (account?.provider === 'google' && user.email) {
          const dbUser = await db.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true, email: true }
          })
          
          if (dbUser) {
            token.role = (dbUser.role as Role) || 'OWNER'
            token.id = dbUser.id
            token.sub = dbUser.id
            token.email = dbUser.email
            console.log('[AUTH] JWT - Google user role:', token.role)
          } else {
            // Fallback if user not found (shouldn't happen due to signIn callback)
            token.role = 'OWNER'
            token.id = user.id
            token.sub = user.id
            console.log('[AUTH] JWT - Google user not found in DB, using fallback')
          }
        } else {
          // For credentials provider
          console.log('[AUTH] JWT - Credentials provider, user ID:', user.id)
          const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: { id: true, role: true, email: true }
          })
          
          if (dbUser) {
            token.role = (dbUser.role as Role) || 'OWNER'
            token.id = dbUser.id
            token.sub = dbUser.id
            token.email = dbUser.email
            console.log('[AUTH] JWT - Credentials user role:', token.role)
          } else {
            // Fallback to user object from authorize
            token.role = (user.role as Role) || 'OWNER'
            token.id = user.id
            token.sub = user.id
            token.email = user.email
            console.log('[AUTH] JWT - Credentials user not found in DB, using authorize data, role:', token.role)
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
        }
      }
      
      // Ensure role is always set (safety check)
      if (!token.role) {
        token.role = 'OWNER'
        console.log('[AUTH] JWT - No role found, defaulting to OWNER')
      }
      
      return token
    },
    async session({ session, token }) {
      console.log('[AUTH] Session callback - token.sub:', token.sub, 'token.role:', token.role)
      if (token && token.sub) {
        session.user.id = token.sub
        session.user.role = (token.role as Role) || 'OWNER'
        console.log('[AUTH] Session callback - final role:', session.user.role)
      } else {
        console.log('[AUTH] Session callback - No token.sub, session might be invalid')
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
          
          // Block login if user doesn't exist - they must register first
          if (!existingUser) {
            return false
          }
          
          // If user exists but doesn't have Google account linked, link it now
          if (existingUser && existingUser.accounts.length === 0) {
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
          }
          
          // Allow login - user exists and account is now linked
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
      console.log('[AUTH] Redirect callback - url:', url, 'baseUrl:', baseUrl)
      
      // Never redirect back to signin page after successful login
      if (url.includes('/auth/signin') || url.includes('/auth/register')) {
        console.log('[AUTH] Redirect callback - preventing redirect to auth page, using dashboard instead')
        return `${baseUrl}/dashboard`
      }
      
      // Allow relative URLs (e.g. "/dashboard", "/dashboard/owner")
      if (url.startsWith('/')) {
        const finalUrl = `${baseUrl}${url}`
        console.log('[AUTH] Redirect callback - relative URL, returning:', finalUrl)
        return finalUrl
      }
      
      // Allow same-origin absolute URLs
      try {
        const urlObj = new URL(url)
        if (urlObj.origin === baseUrl) {
          console.log('[AUTH] Redirect callback - same origin, returning:', url)
          return url
        }
      } catch (e) {
        // Ignore parsing errors and fallback below
      }
      
      // Default for sign-in: send users to the main dashboard
      // Middleware will redirect to role-specific dashboard
      console.log('[AUTH] Redirect callback - default fallback to dashboard')
      return `${baseUrl}/dashboard`
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
