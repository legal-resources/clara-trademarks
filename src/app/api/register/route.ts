import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Solo se permiten correos @clara.team
    if (!email.toLowerCase().endsWith("@clara.team")) {
      return NextResponse.json(
        { error: "Solo se permiten correos con dominio @clara.team" },
        { status: 403 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Este correo ya está registrado" },
        { status: 409 }
      );
    }

    // Hash de contraseña con costo 12 (seguro para producción)
    const passwordHash = await bcrypt.hash(password, 12);

    await sql`
      INSERT INTO users (email, password_hash, full_name)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${fullName || null})
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
