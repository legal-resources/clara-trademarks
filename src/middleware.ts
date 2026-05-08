import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// El middleware usa SOLO la config ligera (sin bcryptjs) → compatible con Edge Runtime
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
