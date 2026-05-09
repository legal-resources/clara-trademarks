import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware 100% Edge-compatible — no importa next-auth ni jose
// Solo verifica si existe la cookie de sesión de NextAuth
export function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // NextAuth v5 (Auth.js) usa "authjs.session-token"
  // Se incluyen también los nombres de v4 como fallback
  const sessionToken =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token") ??
    request.cookies.get("next-auth.session-token") ??
    request.cookies.get("__Secure-next-auth.session-token");

  const isLoggedIn = !!sessionToken;

  const publicRoutes = ["/login", "/register", "/api"];
  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // No autenticado → redirigir al login
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Autenticado en ruta de auth → redirigir al dashboard
  if (isLoggedIn && ["/login", "/register"].some((r) => nextUrl.pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/trademarks", nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
