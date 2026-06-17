import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

/**
 * NextAuth configuration — separated from the route file to avoid
 * circular imports when imported by `@/lib/auth`.
 */

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Demo',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Demo mode: accept demo@theviralfindsmy.com / demo1234
        if (credentials?.email === 'demo@theviralfindsmy.com' && credentials?.password === 'demo1234') {
          return { id: 'demo-user', name: 'TheViralFinds', email: 'demo@theviralfindsmy.com' }
        }
        return null
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-dev-secret-not-secure',
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.uid
      return session
    },
  },
}
