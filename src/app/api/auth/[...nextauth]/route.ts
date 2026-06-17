import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

/**
 * NextAuth configuration for TheViralFindsMY.
 *
 * Demo mode:
 *   - Accepts `demo@theviralfindsmy.com` / `demo1234` as a single demo user.
 *   - JWT-based sessions (no DB session store required).
 *   - The `jwt` callback stores `user.id` on the token, and the `session`
 *     callback surfaces it as `session.user.id` so `requireUser()` can read
 *     the authenticated user id from `getServerSession()`.
 *
 * Production:
 *   - Swap the `authorize` function for a DB-backed credential check
 *     (Prisma + bcrypt), or replace with an OAuth provider. The rest of the
 *     app is already wired to call `requireUser()` / `requireAuth()`, so
 *     no API route changes will be needed.
 */
const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Demo',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Demo mode: accept demo@theviralfindsmy.com / demo1234
        // In production, verify against DB
        if (
          credentials?.email === 'demo@theviralfindsmy.com' &&
          credentials?.password === 'demo1234'
        ) {
          return {
            id: 'demo-user',
            name: 'TheViralFinds',
            email: 'demo@theviralfindsmy.com',
          }
        }
        return null
      },
    }),
  ],
  session: { strategy: 'jwt' as const },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.uid = user.id
      return token
    },
    async session({ session, token }: any) {
      if (session.user) (session.user as any).id = token.uid
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST, authOptions }
