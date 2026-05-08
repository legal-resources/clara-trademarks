import { NextResponse } from "next/server";

// Este endpoint ya no se usa con NextAuth — redirige al dashboard
export async function GET() {
  return NextResponse.redirect(new URL("/trademarks", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
