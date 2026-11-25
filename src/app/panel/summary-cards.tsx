import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addToTotals, formatCents, type Totals } from "@/lib/transactions";

// Tamaño de cada bloque pedido con range(). No se supone que el servidor
// devuelva bloques de este tamaño: se avanza según las filas recibidas.
const PAGE_SIZE = 1000;
// Tope de vueltas: con bloques de 1000 cubre hasta 200.000 movimientos, más
// que suficiente para una app personal (50 movimientos al día durante 10 años
// son unos 182.500), y limita el peor caso a 200 peticiones si el servidor
// devolviera bloques más pequeños.
const MAX_PAGES = 200;

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// Lee (type, amount) de TODOS los movimientos del usuario por bloques y los
// suma en céntimos. Devuelve null si algo falla o no cuadra con count.
async function loadTotals(
  supabase: SupabaseClient,
  userId: string,
): Promise<Totals | null> {
  let totals: Totals = { incomeCents: 0, expenseCents: 0 };
  let expected: number | null = null;
  let received = 0;
  let from = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    // RLS limita a las filas propias; el filtro por user_id es una segunda
    // barrera. order('id') da un orden estable para range().
    const { data, error, count } = await supabase
      .from("transactions")
      .select("type, amount", { count: "exact" })
      .eq("user_id", userId)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error || count === null || !Array.isArray(data)) return null;
    // Si el total cambia entre bloques, los datos han cambiado mientras se
    // leían: no se da ninguna cifra.
    if (expected === null) {
      expected = count;
    } else if (count !== expected) {
      return null;
    }
    if (received === expected || data.length === 0) break;

    const next = addToTotals(totals, data);
    if (next === null) return null;
    totals = next;
    received += data.length;
    from += data.length;
    if (received >= expected) break;
  }

  // Tope alcanzado sin completar, bloque vacío antes de tiempo o más filas
  // de las contadas: no cuadra.
  if (expected === null || received !== expected) return null;
  return totals;
}

// Lee la sesión y datos del usuario: va dentro de <Suspense> en page.tsx.
export async function SummaryCards() {
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

  const totals = await loadTotals(supabase, claims.sub);
  if (totals === null) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        No se han podido calcular los totales.
      </p>
    );
  }

  const balanceCents = totals.incomeCents - totals.expenseCents;
  const balanceColor =
    balanceCents > 0
      ? "text-green-700 dark:text-green-400"
      : balanceCents < 0
        ? "text-red-700 dark:text-red-400"
        : "text-zinc-900 dark:text-zinc-100";

  const cards = [
    {
      title: "Ingresos",
      value: formatCents(totals.incomeCents),
      color: "text-green-700 dark:text-green-400",
    },
    {
      title: "Gastos",
      value: formatCents(totals.expenseCents),
      color: "text-red-700 dark:text-red-400",
    },
    { title: "Saldo", value: formatCents(balanceCents), color: balanceColor },
  ];

  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="min-w-0 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">
            {card.title}
          </dt>
          <dd
            className={`mt-1 text-2xl font-semibold tabular-nums wrap-anywhere sm:text-lg ${card.color}`}
          >
            {card.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
