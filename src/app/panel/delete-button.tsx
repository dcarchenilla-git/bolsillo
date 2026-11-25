"use client";

import { useActionState } from "react";
import { deleteTransaction } from "./actions";
import type { DeleteTransactionState } from "@/lib/transactions";

export function DeleteButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<
    DeleteTransactionState,
    FormData
  >(deleteTransaction, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-300 px-3 py-1 text-sm font-medium text-zinc-800 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200"
      >
        {pending ? "Borrando…" : "Borrar"}
      </button>
      {state?.message && (
        <p
          role="status"
          aria-live="polite"
          className="text-right text-xs text-red-700 dark:text-red-400"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
