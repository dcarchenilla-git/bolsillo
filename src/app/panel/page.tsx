import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Panel · Bolsillo",
};

export default function PanelPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-center font-sans dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Tu panel
      </h1>
      <Suspense
        fallback={
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Cargando…</p>
        }
      >
        <Greeting />
      </Suspense>
    </main>
  );
}

// Lee la sesión (cookies): por eso va dentro de <Suspense>.
async function Greeting() {
  // Supabase compara la caducidad del token con Date.now(). connection()
  // hace que eso se ejecute solo con la petición real, no al prerenderizar.
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect("/login");
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-4">
      <p className="break-all text-lg text-zinc-700 dark:text-zinc-300">
        Hola, {claims.email ?? "usuario"}
      </p>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-lg bg-zinc-950 px-4 py-2 font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
