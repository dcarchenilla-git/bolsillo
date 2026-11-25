"use client";

import { useActionState, useState } from "react";
import { createTransaction } from "./actions";
import {
  DESCRIPTION_MAX,
  MAX_DATE,
  MIN_DATE,
  isTransactionType,
  type Category,
  type CreateTransactionState,
  type TransactionFormValues,
  type TransactionType,
} from "@/lib/transactions";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
const labelClass =
  "flex flex-col gap-1 text-left text-sm font-medium text-zinc-800 dark:text-zinc-200";

const initialState: CreateTransactionState = {
  status: "idle",
  message: "",
  seq: 0,
  values: null,
};

type Props = {
  categories: Category[];
  // Fecha de hoy calculada en el servidor (AAAA-MM-DD).
  today: string;
};

export function TransactionForm({ categories, today }: Props) {
  const [state, formAction, pending] = useActionState(
    createTransaction,
    initialState,
  );

  const defaults: TransactionFormValues = state.values ?? {
    type: "gasto",
    categoryId: "",
    amount: "",
    description: "",
    occurredOn: today,
  };

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      {/* La key cambia en cada respuesta: tras guardar, el formulario vuelve
          a los valores por defecto; tras un error, conserva lo escrito. */}
      <TransactionFields
        key={state.seq}
        categories={categories}
        defaults={defaults}
      />

      {state.message && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-950 px-4 py-2 font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}

function TransactionFields({
  categories,
  defaults,
}: {
  categories: Category[];
  defaults: TransactionFormValues;
}) {
  const initialType: TransactionType = isTransactionType(defaults.type)
    ? defaults.type
    : "gasto";
  const [type, setType] = useState<TransactionType>(initialType);
  const options = categories.filter((category) => category.kind === type);
  const defaultCategory = options.some((c) => c.id === defaults.categoryId)
    ? defaults.categoryId
    : (options[0]?.id ?? "");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Tipo
        {/* Sin value controlado: React reinicia el formulario tras cada
            envío y así el select vuelve a su defaultValue sin desajustes. */}
        <select
          name="type"
          defaultValue={initialType}
          onChange={(event) =>
            setType(event.target.value === "ingreso" ? "ingreso" : "gasto")
          }
          className={inputClass}
        >
          <option value="gasto">Gasto</option>
          <option value="ingreso">Ingreso</option>
        </select>
      </label>

      <label className={labelClass}>
        Categoría
        {/* key={type}: al cambiar el tipo, la lista se vuelve a montar. */}
        <select
          key={type}
          name="category_id"
          defaultValue={defaultCategory}
          required
          className={inputClass}
        >
          {options.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Importe (€)
        <input
          type="text"
          name="amount"
          inputMode="decimal"
          placeholder="0,00"
          autoComplete="off"
          required
          pattern="\d+([.,]\d{1,2})?"
          defaultValue={defaults.amount}
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        Fecha
        <input
          type="date"
          name="occurred_on"
          required
          min={MIN_DATE}
          max={MAX_DATE}
          defaultValue={defaults.occurredOn}
          className={inputClass}
        />
      </label>

      <label className={`${labelClass} sm:col-span-2`}>
        Descripción (opcional)
        <input
          type="text"
          name="description"
          maxLength={DESCRIPTION_MAX}
          autoComplete="off"
          defaultValue={defaults.description}
          className={inputClass}
        />
      </label>
    </div>
  );
}
