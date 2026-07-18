import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { rateLimit } from "@/lib/security/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const emailNormalizado = email.toLowerCase().slice(0, 200);
        const limite = rateLimit(`login:${emailNormalizado}`, {
          janelaMs: 15 * 60 * 1000,
          max: 10,
        });
        if (!limite.permitido) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, emailNormalizado))
          .limit(1);

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    signIn: async ({ user, account }) => {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;

      const email = user.email.toLowerCase();
      const [existente] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existente) {
        user.id = existente.id;
        return true;
      }

      const [criado] = await db
        .insert(users)
        .values({
          name: user.name ?? email.split("@")[0],
          email,
          passwordHash: null,
        })
        .returning();

      user.id = criado.id;
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
