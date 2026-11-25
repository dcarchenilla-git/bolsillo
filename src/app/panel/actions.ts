"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  DESCRIPTION_MAX,
  isTransactionType,
  isValidDate,
  isValidId,
  parseAmount,
  parseDescription,
  type CreateTransactionState,
  type DeleteTransactionState,
  type TransactionFormValues,
} from "@/lib/transactions";

export async function signOut() {
  const supabase = await createClient();

  // Se vuelve a comprobar la sesión: no se confía solo en el proxy.
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}

const SESSION_MESSAGE = "Tu sesión ha caducado. Vuelve a entrar.";

function readString(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value : null;
}

export async function createTransaction(
  prevState: CreateTransactionState,
  formData: FormData,
): Promise<CreateTransactionState> {
  const seq = prevState.seq + 1;

  const type = readString(formData, "type");
  const categoryId = readString(formData, "category_id");
  const rawAmount = readString(formData, "amount");
  const rawDescription = readString(formData, "description") ?? "";
  const occurredOn = readString(formData, "occurred_on");

  // Solo se devuelve al cliente lo que el propio usuario escribió (recortado).
  const values: TransactionFormValues = {
    type: (type ?? "").slice(0, 20),
    categoryId: (categoryId ?? "").slice(0, 40),
    amount: (rawAmount ?? "").slice(0, 20),
    description: rawDescription.slice(0, DESCRIPTION_MAX * 2),
    occurredOn: (occurredOn ?? "").slice(0, 20),
  };
  const fail = (message: string): CreateTransactionState => ({
    status: "error",
    message,
    seq,
    values,
  });

  const supabase = await createClient();
  // Una Server Action es un punto de entrada aparte: se comprueba la sesión.
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) {
    return fail(SESSION_MESSAGE);
  }

  if (!isTransactionType(type)) {
    return fail("Elige si es un ingreso o un gasto.");
  }
  if (!isValidId(categoryId)) {
    return fail("Elige una categoría.");
  }
  const amount = rawAmount === null ? null : parseAmount(rawAmount);
  if (amount === null) {
    return fail(
      "Escribe un importe mayor que 0 y menor que 1.000.000.000, con hasta dos decimales (por ejemplo 12,50).",
    );
  }
  if (occurredOn === null || !isValidDate(occurredOn)) {
    return fail("Escribe una fecha válida entre 01/01/2000 y 31/12/2100.");
  }
  const description = parseDescription(rawDescription);
  if (description === undefined) {
    return fail(
      `La descripción no puede tener más de ${DESCRIPTION_MAX} caracteres.`,
    );
  }

  // La categoría debe existir y ser del mismo tipo (se pregunta a la BD).
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, kind")
    .eq("id", categoryId)
    .maybeSingle();
  if (categoryError) {
    return fail("No se ha podido guardar el movimiento. Inténtalo de nuevo.");
  }
  if (!category || category.kind !== type) {
    return fail("Elige una categoría válida para el tipo de movimiento.");
  }

  // user_id no se envía: lo pone la BD (default auth.uid()) y lo exige RLS.
  const { error } = await supabase.from("transactions").insert({
    type,
    category_id: category.id,
    amount,
    description,
    occurred_on: occurredOn,
  });
  if (error) {
    return fail("No se ha podido guardar el movimiento. Inténtalo de nuevo.");
  }

  refresh();
  return { status: "ok", message: "Movimiento guardado.", seq, values: null };
}

export async function deleteTransaction(
  _prevState: DeleteTransactionState,
  formData: FormData,
): Promise<DeleteTransactionState> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const claims = auth?.claims;
  if (!claims) {
    return { message: SESSION_MESSAGE };
  }

  const id = formData.get("id");
  if (!isValidId(id)) {
    return { message: "No se ha podido borrar el movimiento." };
  }

  // RLS ya limita a las filas propias; el filtro por user_id es una segunda
  // barrera. Si no coincide nada, Supabase no da error: devuelve 0 filas.
  const { data, error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", claims.sub)
    .select("id");
  if (error || !data || data.length === 0) {
    return { message: "No se ha podido borrar el movimiento." };
  }

  refresh();
  return null;
}
