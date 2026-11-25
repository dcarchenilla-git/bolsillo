import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  formatAmount,
  formatDate,
  toTransactionItems,
} from "@/lib/transactions";
import { DeleteButton } from "./delete-button";

const LIMIT = 100;

// Lee la sesión y datos del usuario: va dentro de <Suspense> en page.tsx.
export async function TransactionList() {
  // Supabase compara la caducidad del token con Date.now(). connection()
  // hace que eso se ejecute solo con la petición real, no al prerenderizar.
  await connection();
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const claims = auth?.claims;
  if (!claims) {
    // Greeting ya redirige a /login; aquí no se muestra nada.
    return null;
  }

  // RLS limita a las filas propias; el filtro por user_id es una segunda
  // barrera. Se piden LIMIT + 1 para saber si hay más.
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, type, amount, description, occurred_on, created_at, categories(name)",
    )
    .eq("user_id", claims.sub)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(LIMIT + 1);

  if (error) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        No se han podido cargar los movimientos.
      </p>
    );
  }

  const items = toTransactionItems(data?.slice(0, LIMIT));
  if (items.length === 0) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        Todavía no tienes movimientos.
      </p>
    );
  }

  // Se cuenta sobre las filas recibidas (no sobre las ya convertidas).
  const hasMore = (data?.length ?? 0) > LIMIT;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="break-words font-medium text-zinc-900 dark:text-zinc-100">
                {item.categoryName}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatDate(item.occurredOn)}
              </p>
              {item.description && (
                <p className="mt-1 break-words text-sm text-zinc-700 dark:text-zinc-300">
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <p
                className={`whitespace-nowrap font-semibold ${
                  item.type === "ingreso"
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-700 dark:text-red-400"
                }`}
              >
                {formatAmount(item.type, item.amount)}
              </p>
              <DeleteButton id={item.id} />
            </div>
          </li>
        ))}
      </ul>
      {hasMore && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Solo se muestran los últimos 100 movimientos.
        </p>
      )}
    </div>
  );
}
