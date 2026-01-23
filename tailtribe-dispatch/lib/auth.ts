import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

const splitName = (fullName?: string | null) => {
  const clean = (fullName ?? '').trim()
  if (!clean) return { firstName: 'Gebruiker', lastName: '' }
  const parts = clean.split(/\s+/)
  const firstName = parts.shift() || 'Gebruiker'
  const lastName = parts.join(' ')
  return { firstName, lastName }
}

const getOrCreateOAuthUser = async (email: string, name?: string | null) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return existing
  const { firstName, lastName } = splitName(name)
  return prisma.user.create({
    data: {
      email,
      role: 'OWNER',
      firstName,
      lastName,
      passwordHash: null,
    },
  })
}

const isDev = process.env.NODE_ENV === 'development'
const authDebug = isDev && process.env.AUTH_DEBUG === 'true'
const nextAuthUrl =
  process.env.NEXTAUTH_URL || (isDev ? 'http://localhost:3001' : undefined)
const nextAuthSecret = process.env.NEXTAUTH_SECRET

const googleClientId = (process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '').trim() || undefined
const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET ?? '').trim() || undefined

// IMPORTANT:
// Don't throw at module import time. Next.js may import route handlers during build
// ("Collecting page data"), which would fail the whole deployment if env vars are
// not present yet. Instead, validate lazily when auth is actually used.
const assertNextAuthSecret = () => {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET ontbreekt. Stel deze in in Vercel Environment Variables (Production) of .env.local.')
  }
}

if (isDev) {
  if (!process.env.NEXTAUTH_URL && nextAuthUrl) {
    process.env.NEXTAUTH_URL = nextAuthUrl
  }

  if (nextAuthUrl !== 'http://localhost:3001') {
    throw new Error('NEXTAUTH_URL moet in development exact http://localhost:3001 zijn.')
  }

  console.log('[auth] env', {
    NEXTAUTH_URL: Boolean(nextAuthUrl),
    NEXTAUTH_SECRET: Boolean(nextAuthSecret),
    GOOGLE_CLIENT_ID: Boolean(googleClientId),
    GOOGLE_CLIENT_SECRET: Boolean(googleClientSecret),
  })
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // On Vercel (and while DNS is propagating), requests may come in on different hosts
  // than NEXTAUTH_URL. trustHost avoids hard failures that surface as
  // "There was a problem with the server configuration."
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          return null
        }

        if (user.passwordHash && !user.emailVerified) {
          return null
        }

        const hashToCheck = user.passwordHash || (user as any).password
        if (!hashToCheck) {
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          hashToCheck
        )

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: (user as any).name || `${(user as any).firstName ?? ''} ${(user as any).lastName ?? ''}`.trim() || user.email,
          role: user.role,
        }
      },
    }),
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
  ],
  debug: authDebug,
  callbacks: {
    async signIn({ user, account }) {
      assertNextAuthSecret()
      if (authDebug) {
        console.log('[auth][signIn]', {
          provider: account?.provider,
          type: account?.type,
          hasEmail: Boolean(user?.email),
        })
      }
      return true
    },
    async jwt({ token, user }) {
      assertNextAuthSecret()
      if (user?.email) {
        const dbUser = await getOrCreateOAuthUser(user.email, user.name ?? null)
        token.role = dbUser.role
        token.id = dbUser.id
        token.email = dbUser.email
      } else if (token.email && (!token.id || !token.role)) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.id = dbUser.id
        }
      }
      if (authDebug) {
        console.log('[auth][jwt]', {
          role: token.role,
          hasEmail: Boolean(token.email),
          hasId: Boolean(token.id),
        })
      }
      return token
    },
    async session({ session, token }) {
      assertNextAuthSecret()
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      if (authDebug) {
        console.log('[auth][session]', {
          role: session.user?.role,
        })
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
})
