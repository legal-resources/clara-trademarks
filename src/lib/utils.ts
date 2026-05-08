import { differenceInDays, format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: (string | undefined | null | false | 0)[]): string {
  return inputs.filter(Boolean).join(" ");
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "—";
    return format(date, "dd MMM yyyy", { locale: es });
  } catch {
    return "—";
  }
}

export function formatCurrency(amount: number | null, currency = "USD"): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(amount);
}

export function getDaysUntil(dateString: string | null): number | null {
  if (!dateString) return null;
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return null;
    return differenceInDays(date, new Date());
  } catch {
    return null;
  }
}

export function getExpirationStatus(
  dateString: string | null
): "ok" | "warning" | "danger" | "expired" | null {
  const days = getDaysUntil(dateString);
  if (days === null) return null;
  if (days < 0) return "expired";
  if (days <= 30) return "danger";
  if (days <= 90) return "warning";
  return "ok";
}

export function niceClassesLabel(classes: number[]): string {
  if (!classes || classes.length === 0) return "—";
  return classes.sort((a, b) => a - b).map((c) => `Clase ${c}`).join(", ");
}

export function truncate(text: string, length = 50): string {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
}
