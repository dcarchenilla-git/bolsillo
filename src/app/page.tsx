export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-center font-sans dark:bg-black">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
        Bolsillo
      </h1>
      <p className="mt-4 max-w-md text-lg leading-8 text-zinc-600 sm:text-xl dark:text-zinc-400">
        Lleva el control de tus ingresos y gastos de forma sencilla.
      </p>
    </main>
  );
}
