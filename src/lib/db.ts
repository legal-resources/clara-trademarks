import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida en las variables de entorno");
}

// Cliente SQL con tagged template literals (previene SQL injection automáticamente)
export const sql = neon(process.env.DATABASE_URL);
