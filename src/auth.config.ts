import type { NextAuthConfig } from "next-auth";

// Configuración ligera — compatible con Edge Runtime (middleware)
// NO importa bcryptjs ni nada de Node.js
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute = ["/login", "/register"].some((route) =>
        nextUrl.pathname.startsWith(route)
      );

      if (!isLoggedIn && !isPublicRoute) {
        // Redirigir al login con callbackUrl
        const loginUrl = new URL("/login", nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      if (isLoggedIn && isPublicRoute) {
        return Response.redirect(new URL("/trademarks", nextUrl.origin));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // vacío aquí — los providers van en auth.ts
} satisfies NextAuthConfig;
