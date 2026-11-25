import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Lee cookies de la petición: quien lo use debe estar dentro de <Suspense>
// y nunca dentro de 'use cache' (cacheComponents).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // En Server Components no se pueden escribir cookies;
            // el futuro proxy refrescará la sesión.
          }
        },
      },
    },
  );
}
