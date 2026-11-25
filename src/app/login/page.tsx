import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar · Bolsillo",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link
          href="/"
          className="self-start rounded-md text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
        >
          ← Volver al inicio
        </Link>
        <div className="flex w-full flex-col items-center gap-6 rounded-xl border border-zinc-200 bg-white px-6 py-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Entra en Bolsillo
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Si es la primera vez que entras, escribe tu correo y una
              contraseña y pulsa «Crear cuenta».
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
    </main>
  );
}

// Lee la sesión (cookies): por eso va dentro de <Suspense>.
// No pinta nada; si hay sesión, manda a /panel.
async function RedirectIfSignedIn() {
  // Supabase compara la caducidad del token con Date.now(). connection()
  // hace que eso se ejecute solo con la petición real, no al prerenderizar.
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/panel");
  }

  return null;
}
