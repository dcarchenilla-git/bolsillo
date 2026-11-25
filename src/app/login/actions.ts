"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { message: string } | null;

// Formato razonable: algo@algo.algo, sin espacios.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Credentials = { email: string; password: string };

function readCredentials(
  formData: FormData,
): { ok: true; data: Credentials } | { ok: false; message: string } {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { ok: false, message: "Rellena el correo y la contraseña." };
  }

  const cleanEmail = email.trim();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { ok: false, message: "Escribe un correo válido." };
  }
  if (password.length < 6) {
    return {
      ok: false,
      message: "La contraseña debe tener al menos 6 caracteres.",
    };
  }

  return { ok: true, data: { email: cleanEmail, password } };
}

export async function authenticate(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const intent = formData.get("intent");
  if (intent !== "entrar" && intent !== "crear") {
    return { message: "Acción no válida." };
  }

  const parsed = readCredentials(formData);
  if (!parsed.ok) {
    return { message: parsed.message };
  }

  const supabase = await createClient();

  if (intent === "entrar") {
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      return { message: "Correo o contraseña incorrectos." };
    }
    // redirect() lanza una excepción: va fuera de cualquier try/catch.
    redirect("/panel");
  }

  const { data, error } = await supabase.auth.signUp(parsed.data);
  if (error) {
    return { message: "No se ha podido crear la cuenta." };
  }
  if (!data.session) {
    return {
      message:
        "Cuenta creada. Revisa tu correo para confirmarla antes de entrar.",
    };
  }
  redirect("/panel");
}
