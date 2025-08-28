import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const isAdminUser = credentials.username === process.env.ADMIN_USERNAME;
        const isValidPassword = credentials.password === process.env.ADMIN_PASSWORD;

        if (isAdminUser && isValidPassword) {
          return { id: '1', name: 'Admin', email: 'admin@example.com' };
        } else {
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };