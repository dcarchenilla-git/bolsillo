import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresca la sesión de Supabase en cada petición, protege /panel
// y manda a /panel a quien abre /login con sesión.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          // Cache-Control, Expires y Pragma: evitan que se cachee la sesión.
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // No poner código entre createServerClient y getClaims().
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const path = request.nextUrl.pathname;
  const isPanel = path === "/panel" || path.startsWith("/panel/");
  // Solo GET: un POST a /login es la Server Action del formulario.
  const isLoginPage = path === "/login" && request.method === "GET";

  let target: string | null = null;
  if (isPanel && !claims) target = "/login";
  else if (isLoginPage && claims) target = "/panel";

  if (target) {
    const url = request.nextUrl.clone();
    url.pathname = target;
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    // Conservar las cookies y cabeceras anti-caché que haya escrito setAll.
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));
    ["cache-control", "expires", "pragma"].forEach((key) => {
      const value = supabaseResponse.headers.get(key);
      if (value) redirectResponse.headers.set(key, value);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}
