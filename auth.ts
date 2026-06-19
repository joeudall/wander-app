import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const rows = await sql`
          SELECT id, email, password_hash FROM users WHERE email = ${credentials.email as string}
        `
        const user = rows[0]
        if (!user) return null

        const valid = await bcrypt.compare(credentials.password as string, user.password_hash)
        if (!valid) return null

        return { id: user.id, email: user.email }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
})
