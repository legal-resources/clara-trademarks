import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { authConfig } from "./auth.config";

// Configuración completa — solo se ejecuta en Node.js runtime (no en Edge)
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const rows = await sql`
          SELECT id, email, password_hash, full_name, role
          FROM users
          WHERE email = ${email.toLowerCase()}
          LIMIT 1
        `;

        if (rows.length === 0) return null;

        const user = rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash as string);
        if (!isValid) return null;

        return {
          id: user.id as string,
          email: user.email as string,
          name: (user.full_name as string) || (user.email as string),
          role: user.role as string,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
});
