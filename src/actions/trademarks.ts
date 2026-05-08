"use server";

// Clara Trademarks — Server Actions v2
import { sql } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Trademark, TrademarkStatus } from "@/lib/types";

type SafeSession = {
  user: { id: string; email?: string | null; name?: string | null };
};

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────
async function getSession(): Promise<SafeSession> {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
    throw new Error("No autenticado"); // nunca se ejecuta, pero TypeScript lo necesita
  }
  return session as SafeSession;
}

function parseDate(value: FormDataEntryValue | null): string | null {
  if (!value || value === "") return null;
  return value as string;
}

function parseFloatVal(value: FormDataEntryValue | null): number | null {
  if (!value || value === "") return null;
  const n = parseFloat(value as string);
  return isNaN(n) ? null : n;
}

// ────────────────────────────────────────────────
// GET TRADEMARKS
// ────────────────────────────────────────────────
export async function getTrademarks(filters?: {
  status?: TrademarkStatus;
  country?: string;
  search?: string;
}) {
  let rows: unknown[];

  if (filters?.search && filters?.status && filters?.country) {
    rows = await sql`
      SELECT * FROM trademarks
      WHERE is_deleted = false
        AND status = ${filters.status}
        AND country = ${filters.country}
        AND (name ILIKE ${"%" + filters.search + "%"} OR owner_name ILIKE ${"%" + filters.search + "%"} OR application_number ILIKE ${"%" + filters.search + "%"})
      ORDER BY created_at DESC`;
  } else if (filters?.search && filters?.status) {
    rows = await sql`
      SELECT * FROM trademarks
      WHERE is_deleted = false AND status = ${filters.status}
        AND (name ILIKE ${"%" + filters.search + "%"} OR owner_name ILIKE ${"%" + filters.search + "%"})
      ORDER BY created_at DESC`;
  } else if (filters?.search && filters?.country) {
    rows = await sql`
      SELECT * FROM trademarks
      WHERE is_deleted = false AND country = ${filters.country}
        AND (name ILIKE ${"%" + filters.search + "%"} OR owner_name ILIKE ${"%" + filters.search + "%"})
      ORDER BY created_at DESC`;
  } else if (filters?.status && filters?.country) {
    rows = await sql`
      SELECT * FROM trademarks
      WHERE is_deleted = false AND status = ${filters.status} AND country = ${filters.country}
      ORDER BY created_at DESC`;
  } else if (filters?.search) {
    rows = await sql`
      SELECT * FROM trademarks
      WHERE is_deleted = false
        AND (name ILIKE ${"%" + filters.search + "%"} OR owner_name ILIKE ${"%" + filters.search + "%"} OR application_number ILIKE ${"%" + filters.search + "%"})
      ORDER BY created_at DESC`;
  } else if (filters?.status) {
    rows = await sql`
      SELECT * FROM trademarks WHERE is_deleted = false AND status = ${filters.status}
      ORDER BY created_at DESC`;
  } else if (filters?.country) {
    rows = await sql`
      SELECT * FROM trademarks WHERE is_deleted = false AND country = ${filters.country}
      ORDER BY created_at DESC`;
  } else {
    rows = await sql`
      SELECT * FROM trademarks WHERE is_deleted = false ORDER BY created_at DESC`;
  }

  return rows as Trademark[];
}

// ────────────────────────────────────────────────
// GET SINGLE TRADEMARK
// ────────────────────────────────────────────────
export async function getTrademark(id: string): Promise<Trademark | null> {
  const rows = await sql`
    SELECT * FROM trademarks WHERE id = ${id} AND is_deleted = false LIMIT 1`;
  return rows.length > 0 ? (rows[0] as Trademark) : null;
}

// ────────────────────────────────────────────────
// CREATE TRADEMARK
// ────────────────────────────────────────────────
export async function createTrademark(formData: FormData) {
  const session = await getSession();
  const userId = session.user.id;

  const niceClasses = (formData.get("nice_classes") as string || "")
    .split(",").map((c) => parseInt(c.trim())).filter((n) => !isNaN(n));
  const tags = (formData.get("tags") as string || "")
    .split(",").map((t) => t.trim()).filter(Boolean);

  const rows = await sql`
    INSERT INTO trademarks (
      name, brand_type, owner_name, country, jurisdiction,
      nice_classes, goods_services_description,
      application_number, registration_number, publication_number,
      status, filing_date, examination_date, publication_date,
      opposition_deadline, registration_date, expiration_date, next_renewal_date,
      agent_name, agent_email, agent_phone, agent_firm,
      official_fees_paid, fee_payment_date, fee_amount, fee_currency,
      has_priority_claim, priority_country, priority_date, priority_number,
      notes, tags, created_by, updated_by
    ) VALUES (
      ${formData.get("name")},
      ${formData.get("brand_type") || "nominativa"},
      ${formData.get("owner_name")},
      ${formData.get("country")},
      ${formData.get("jurisdiction") || null},
      ${niceClasses},
      ${formData.get("goods_services_description") || null},
      ${formData.get("application_number") || null},
      ${formData.get("registration_number") || null},
      ${formData.get("publication_number") || null},
      ${formData.get("status") || "solicitud_presentada"},
      ${parseDate(formData.get("filing_date"))},
      ${parseDate(formData.get("examination_date"))},
      ${parseDate(formData.get("publication_date"))},
      ${parseDate(formData.get("opposition_deadline"))},
      ${parseDate(formData.get("registration_date"))},
      ${parseDate(formData.get("expiration_date"))},
      ${parseDate(formData.get("next_renewal_date"))},
      ${formData.get("agent_name") || null},
      ${formData.get("agent_email") || null},
      ${formData.get("agent_phone") || null},
      ${formData.get("agent_firm") || null},
      ${formData.get("official_fees_paid") === "true"},
      ${parseDate(formData.get("fee_payment_date"))},
      ${parseFloatVal(formData.get("fee_amount"))},
      ${formData.get("fee_currency") || "USD"},
      ${formData.get("has_priority_claim") === "true"},
      ${formData.get("priority_country") || null},
      ${parseDate(formData.get("priority_date"))},
      ${formData.get("priority_number") || null},
      ${formData.get("notes") || null},
      ${tags}, ${userId}, ${userId}
    ) RETURNING id`;

  const newId = rows[0].id as string;
  await sql`
    INSERT INTO trademark_history (trademark_id, changed_by, action, notes)
    VALUES (${newId}, ${userId}, 'created', 'Registro creado')`;

  revalidatePath("/trademarks");
  redirect(`/trademarks/${newId}`);
}

// ────────────────────────────────────────────────
// UPDATE TRADEMARK
// ────────────────────────────────────────────────
export async function updateTrademark(id: string, formData: FormData) {
  const session = await getSession();
  const userId = session.user.id;

  const niceClasses = (formData.get("nice_classes") as string || "")
    .split(",").map((c) => parseInt(c.trim())).filter((n) => !isNaN(n));
  const tags = (formData.get("tags") as string || "")
    .split(",").map((t) => t.trim()).filter(Boolean);

  await sql`
    UPDATE trademarks SET
      name = ${formData.get("name")},
      brand_type = ${formData.get("brand_type") || "nominativa"},
      owner_name = ${formData.get("owner_name")},
      country = ${formData.get("country")},
      jurisdiction = ${formData.get("jurisdiction") || null},
      nice_classes = ${niceClasses},
      goods_services_description = ${formData.get("goods_services_description") || null},
      application_number = ${formData.get("application_number") || null},
      registration_number = ${formData.get("registration_number") || null},
      publication_number = ${formData.get("publication_number") || null},
      status = ${formData.get("status")},
      filing_date = ${parseDate(formData.get("filing_date"))},
      examination_date = ${parseDate(formData.get("examination_date"))},
      publication_date = ${parseDate(formData.get("publication_date"))},
      opposition_deadline = ${parseDate(formData.get("opposition_deadline"))},
      registration_date = ${parseDate(formData.get("registration_date"))},
      expiration_date = ${parseDate(formData.get("expiration_date"))},
      next_renewal_date = ${parseDate(formData.get("next_renewal_date"))},
      agent_name = ${formData.get("agent_name") || null},
      agent_email = ${formData.get("agent_email") || null},
      agent_phone = ${formData.get("agent_phone") || null},
      agent_firm = ${formData.get("agent_firm") || null},
      official_fees_paid = ${formData.get("official_fees_paid") === "true"},
      fee_payment_date = ${parseDate(formData.get("fee_payment_date"))},
      fee_amount = ${parseFloatVal(formData.get("fee_amount"))},
      fee_currency = ${formData.get("fee_currency") || "USD"},
      has_priority_claim = ${formData.get("has_priority_claim") === "true"},
      priority_country = ${formData.get("priority_country") || null},
      priority_date = ${parseDate(formData.get("priority_date"))},
      priority_number = ${formData.get("priority_number") || null},
      notes = ${formData.get("notes") || null},
      tags = ${tags},
      updated_by = ${userId}
    WHERE id = ${id} AND is_deleted = false`;

  await sql`
    INSERT INTO trademark_history (trademark_id, changed_by, action, notes)
    VALUES (${id}, ${userId}, 'updated', 'Registro actualizado')`;

  revalidatePath(`/trademarks/${id}`);
  revalidatePath("/trademarks");
  redirect(`/trademarks/${id}`);
}

// ────────────────────────────────────────────────
// SOFT DELETE
// ────────────────────────────────────────────────
export async function deleteTrademark(id: string) {
  const session = await getSession();
  const userId = session.user.id;

  await sql`UPDATE trademarks SET is_deleted = true, updated_by = ${userId} WHERE id = ${id}`;
  await sql`
    INSERT INTO trademark_history (trademark_id, changed_by, action, notes)
    VALUES (${id}, ${userId}, 'deleted', 'Registro eliminado')`;

  revalidatePath("/trademarks");
  redirect("/trademarks");
}

// ────────────────────────────────────────────────
// STATS
// ────────────────────────────────────────────────
export async function getTrademarkStats() {
  const rows = await sql`
    SELECT status, expiration_date, next_renewal_date FROM trademarks WHERE is_deleted = false`;

  const total = rows.length;
  const registered = rows.filter((t) => t.status === "registrada").length;
  const pending = rows.filter((t) =>
    ["solicitud_presentada","en_examen","publicada","periodo_oposicion"].includes(t.status as string)
  ).length;

  const today = new Date();
  const in90 = new Date(today);
  in90.setDate(in90.getDate() + 90);

  const expiringsSoon = rows.filter((t) => {
    const d = (t.expiration_date || t.next_renewal_date) as string | null;
    if (!d) return false;
    const date = new Date(d);
    return date >= today && date <= in90;
  }).length;

  const byStatus = rows.reduce((acc, t) => {
    const k = t.status as string;
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { total, registered, pending, expiringsSoon, byStatus };
}

// ────────────────────────────────────────────────
// HISTORY
// ────────────────────────────────────────────────
export async function getTrademarkHistory(trademarkId: string) {
  const rows = await sql`
    SELECT * FROM trademark_history WHERE trademark_id = ${trademarkId}
    ORDER BY changed_at DESC LIMIT 50`;
  return rows;
}
