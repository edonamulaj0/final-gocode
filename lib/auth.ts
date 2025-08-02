import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          class: user.class,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.class = user.class;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.class = token.class;
      }
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      // If the redirect URL is the base URL (after login), redirect to dashboard
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/?page=dashboard`;
      }
      // If it's a relative URL, make it absolute
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // If the URL is on the same domain, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Otherwise, redirect to dashboard
      return `${baseUrl}/?page=dashboard`;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
