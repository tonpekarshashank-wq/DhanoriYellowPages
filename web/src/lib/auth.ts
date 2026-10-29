import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { neon } from "@neondatabase/serverless";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const sql = neon(process.env.DATABASE_URL!);
      const rows = await sql`
        SELECT id, role FROM admin_users WHERE email = ${user.email}
      `;

      if (rows.length === 0) return false;

      // Update last login
      await sql`
        UPDATE admin_users
        SET last_login_at = NOW(),
            name = COALESCE(${user.name}, name),
            image = COALESCE(${user.image}, image)
        WHERE email = ${user.email}
      `;

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const sql = neon(process.env.DATABASE_URL!);
        const rows = await sql`
          SELECT id, role FROM admin_users WHERE email = ${session.user.email}
        `;
        if (rows[0]) {
          session.user.id = String(rows[0].id);
          (session.user as unknown as Record<string, unknown>).role = rows[0].role;
          (session.user as unknown as Record<string, unknown>).dbId = rows[0].id;
        }
      }
      return session;
    },
  },
});
