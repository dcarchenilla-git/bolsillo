// Tipos, validación y formato de movimientos. Sin dependencias de servidor:
// lo usan tanto las Server Actions como los componentes.

export type TransactionType = "ingreso" | "gasto";

export type Category = {
  id: string;
  name: string;
  kind: TransactionType;
};

export type TransactionItem = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  occurredOn: string;
  categoryName: string;
};

// Lo que el usuario escribió, para no perderlo si hay un error.
export type TransactionFormValues = {
  type: string;
  categoryId: string;
  amount: string;
  description: string;
  occurredOn: string;
};

export type CreateTransactionState = {
  status: "idle" | "ok" | "error";
  message: string;
  // Cambia en cada respuesta: el formulario se vuelve a montar con
  // los valores por defecto (éxito) o con lo escrito (error).
  seq: number;
  values: TransactionFormValues | null;
};

export type DeleteTransactionState = { message: string } | null;

export const DESCRIPTION_MAX = 200;
export const MIN_DATE = "2000-01-01";
export const MAX_DATE = "2100-12-31";

// Ids de la BD: entero o uuid.
const ID_REGEX =
  /^(\d{1,18}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
const AMOUNT_REGEX = /^\d+([.,]\d{1,2})?$/;
const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isTransactionType(value: unknown): value is TransactionType {
  return value === "ingreso" || value === "gasto";
}

export function isValidId(value: unknown): value is string {
  return typeof value === "string" && ID_REGEX.test(value);
}

// Devuelve el importe normalizado ("12.50") o null si no es válido.
export function parseAmount(raw: string): string | null {
  const value = raw.trim();
  if (!AMOUNT_REGEX.test(value)) return null;
  const normalized = value.replace(",", ".");
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0 || amount >= 1_000_000_000) {
    return null;
  }
  return normalized;
}

// AAAA-MM-DD, día real y dentro del rango permitido.
export function isValidDate(raw: string): boolean {
  const match = DATE_REGEX.exec(raw);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  const exists =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  return exists && raw >= MIN_DATE && raw <= MAX_DATE;
}

// Recorta; vacía → null; más de DESCRIPTION_MAX → undefined (no válida).
export function parseDescription(raw: string): string | null | undefined {
  const value = raw.trim();
  if (value === "") return null;
  if (value.length > DESCRIPTION_MAX) return undefined;
  return value;
}

// Fecha de hoy en Madrid (AAAA-MM-DD). Usa la hora actual: llamar solo en
// el servidor y después de await connection().
export function todayInMadrid(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// "2025-03-07" → "07/03/2025", sin pasar por Date (sin líos de zona horaria).
export function formatDate(isoDate: string): string {
  const match = DATE_REGEX.exec(isoDate);
  if (!match) return isoDate;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

const euros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export function formatAmount(type: TransactionType, amount: number): string {
  return `${type === "ingreso" ? "+" : "−"}${euros.format(amount)}`;
}

// Importe de la BD (numeric(12,2), positivo): solo cifras y hasta 2 decimales.
// Sin signo ni exponente: "-3", "1e5" o "1.234" no encajan.
const CENTS_REGEX = /^(\d+)(?:\.(\d{1,2}))?$/;

// Convierte un amount (number o string: supabase-js puede devolver cualquiera
// de los dos) a céntimos enteros a partir de su texto, sin multiplicar floats.
// Devuelve null si el importe no es válido.
export function amountToCents(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const match = CENTS_REGEX.exec(String(value));
  if (!match) return null;
  const cents =
    Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

export type Totals = {
  incomeCents: number;
  expenseCents: number;
};

// Suma un bloque de filas (type, amount) a los totales, en céntimos enteros.
// Devuelve null si alguna fila no es válida o si un total deja de ser exacto.
export function addToTotals(totals: Totals, rows: unknown[]): Totals | null {
  let { incomeCents, expenseCents } = totals;
  for (const row of rows) {
    if (!isRecord(row) || !isTransactionType(row.type)) return null;
    const cents = amountToCents(row.amount);
    if (cents === null) return null;
    if (row.type === "ingreso") {
      incomeCents += cents;
    } else {
      expenseCents += cents;
    }
    if (
      !Number.isSafeInteger(incomeCents) ||
      !Number.isSafeInteger(expenseCents)
    ) {
      return null;
    }
  }
  return { incomeCents, expenseCents };
}

// Céntimos enteros → euros es-ES. La división por 100 se hace solo aquí,
// al formatear (Intl redondea a 2 decimales).
export function formatCents(cents: number): string {
  return euros.format(cents / 100);
}

// numeric puede llegar como string o como number desde supabase-js.
function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toId(value: unknown): string | null {
  if (typeof value === "string" && value !== "") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Convierte las filas de public.categories en Category, descartando las raras.
export function toCategories(rows: unknown): Category[] {
  if (!Array.isArray(rows)) return [];
  const result: Category[] = [];
  for (const row of rows) {
    if (!isRecord(row)) continue;
    const id = toId(row.id);
    if (id === null || typeof row.name !== "string") continue;
    if (!isTransactionType(row.kind)) continue;
    result.push({ id, name: row.name, kind: row.kind });
  }
  return result;
}

// Convierte las filas de public.transactions (con categories(name)).
export function toTransactionItems(rows: unknown): TransactionItem[] {
  if (!Array.isArray(rows)) return [];
  const result: TransactionItem[] = [];
  for (const row of rows) {
    if (!isRecord(row)) continue;
    const id = toId(row.id);
    const amount = toNumber(row.amount);
    if (id === null || amount === null) continue;
    if (!isTransactionType(row.type)) continue;
    if (typeof row.occurred_on !== "string") continue;

    // Relación muchos-a-uno: llega como objeto (por si acaso, también array).
    const related = Array.isArray(row.categories)
      ? row.categories[0]
      : row.categories;
    const categoryName =
      isRecord(related) && typeof related.name === "string"
        ? related.name
        : "Sin categoría";

    result.push({
      id,
      type: row.type,
      amount,
      description:
        typeof row.description === "string" && row.description !== ""
          ? row.description
          : null,
      occurredOn: row.occurred_on,
      categoryName,
    });
  }
  return result;
}
