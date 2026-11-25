import Link from "next/link";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50";

const features = [
  {
    title: "Apunta tus ingresos y gastos",
    text: "Guarda cada movimiento con su importe, su categoría y su fecha.",
  },
  {
    title: "Controla tu saldo",
    text: "Mira de un vistazo cuánto has ingresado, cuánto has gastado y lo que te queda.",
  },
  {
    title: "Tus datos son solo tuyos",
    text: "Cada cuenta solo puede ver y borrar sus propios movimientos.",
  },
];

// Cifras fijas, escritas a mano: la portada no lee sesión ni datos.
// Mismo formato que formatCents en el panel (es-ES, euros).
const exampleCards = [
  {
    title: "Ingresos",
    value: "950,00 €",
    color: "text-green-700 dark:text-green-400",
  },
  {
    title: "Gastos",
    value: "412,35 €",
    color: "text-red-700 dark:text-red-400",
  },
  {
    title: "Saldo",
    value: "537,65 €",
    color: "text-zinc-900 dark:text-zinc-100",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <div className="flex w-full max-w-3xl flex-col gap-12">
        <section className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
            Bolsillo
          </h1>
          <p className="mt-4 max-w-md text-lg leading-8 text-zinc-600 sm:text-xl dark:text-zinc-400">
            Lleva el control de tus ingresos y gastos de forma sencilla.
          </p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className={`flex-1 rounded-lg bg-zinc-950 px-4 py-2 font-medium text-white dark:bg-zinc-50 dark:text-zinc-950 ${focusClass}`}
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className={`flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${focusClass}`}
            >
              Crear cuenta
            </Link>
          </div>
        </section>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="min-w-0 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">
                {feature.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {feature.text}
              </p>
            </li>
          ))}
        </ul>

        <section
          aria-labelledby="ejemplo-titulo"
          aria-describedby="ejemplo-nota"
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2
            id="ejemplo-titulo"
            className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-sm font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
          >
            Ejemplo
          </h2>
          <p
            id="ejemplo-nota"
            className="mt-2 text-sm text-zinc-600 dark:text-zinc-400"
          >
            Las cifras son ficticias: así se ve el resumen de tu panel.
          </p>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {exampleCards.map((card) => (
              <div
                key={card.title}
                className="min-w-0 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-black"
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
        </section>
      </div>
    </main>
  );
}
