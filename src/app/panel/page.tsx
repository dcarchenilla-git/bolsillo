import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCategories, todayInMadrid } from "@/lib/transactions";
import { signOut } from "./actions";
import { TransactionForm } from "./transaction-form";
import { TransactionList } from "./transaction-list";

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

      <div className="mt-10 flex w-full max-w-xl flex-col gap-10 text-left">
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            Nuevo movimiento
          </h2>
          <Suspense
            fallback={
              <p className="text-zinc-600 dark:text-zinc-400">
                Cargando formulario…
              </p>
            }
          >
            <TransactionFormLoader />
          </Suspense>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            Tus movimientos
          </h2>
          <Suspense
            fallback={
              <p className="text-zinc-600 dark:text-zinc-400">
                Cargando movimientos…
              </p>
            }
          >
            <TransactionList />
          </Suspense>
        </section>
      </div>
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

// Lee la sesión y public.categories, y calcula la fecha de hoy: por eso va
// dentro de <Suspense> y después de connection() (nada de esto se prerenderiza).
async function TransactionFormLoader() {
  await connection();
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) {
    // Greeting ya redirige a /login; aquí no se muestra nada.
    return null;
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, kind")
    .order("id", { ascending: true });
  const categories = toCategories(data);

  if (error || categories.length === 0) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        No se han podido cargar las categorías.
      </p>
    );
  }

  return <TransactionForm categories={categories} today={todayInMadrid()} />;
}
