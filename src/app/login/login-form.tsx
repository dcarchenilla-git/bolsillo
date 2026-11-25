"use client";

import { useActionState } from "react";
import { authenticate, type LoginState } from "./actions";

const inputClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
const labelClass =
  "flex flex-col gap-1 text-left text-sm font-medium text-zinc-800 dark:text-zinc-200";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    authenticate,
    null,
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <label className={labelClass}>
        Correo
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Contraseña
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          minLength={6}
          className={inputClass}
        />
      </label>

      {state?.message && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          name="intent"
          value="entrar"
          disabled={pending}
          className="flex-1 rounded-lg bg-zinc-950 px-4 py-2 font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950"
        >
          Entrar
        </button>
        <button
          type="submit"
          name="intent"
          value="crear"
          disabled={pending}
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-950 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-50"
        >
          Crear cuenta
        </button>
      </div>
    </form>
  );
}
