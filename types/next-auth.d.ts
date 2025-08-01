import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      class: string;
      email: string;
      name?: string;
      role?: string;
      class?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    class: string;
    email: string;
    name?: string;
    role?: string;
    class?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    class: string;
    id: string;
    email: string;
    name?: string;
    role?: string;
    class?: string;
  }
}
