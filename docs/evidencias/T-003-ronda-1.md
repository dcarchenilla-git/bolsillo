# T-003 · Ronda 1

## Entrega de Develop (literal)

T-003 · Ronda 1

La autenticación con correo y contraseña está hecha y `npm run lint` y `npm run build` pasan sin errores. No la he probado en el navegador ni contra Supabase: no arranqué servidores de desarrollo porque la asignación lo prohíbe. Por eso no puedo afirmar que entrar, crear cuenta o cerrar sesión funcionen de verdad; eso queda para Testing o el usuario.

## Archivos cambiados
Nuevos:
- C:\ia\claude\bolsillo\src\proxy.ts
- C:\ia\claude\bolsillo\src\lib\supabase\proxy.ts
- C:\ia\claude\bolsillo\src\app\login\page.tsx
- C:\ia\claude\bolsillo\src\app\login\login-form.tsx
- C:\ia\claude\bolsillo\src\app\login\actions.ts
- C:\ia\claude\bolsillo\src\app\panel\page.tsx
- C:\ia\claude\bolsillo\src\app\panel\actions.ts

Modificado:
- C:\ia\claude\bolsillo\src\lib\supabase\server.ts: solo el comentario del catch, que ahora dice "src/proxy.ts (updateSession) refresca la sesión."

No he tocado nada más. `README.md` (M) y `.claude/launch.json` (??) ya estaban así antes de empezar. `package.json` y `package-lock.json` no cambian y no ejecuté `npm install`. No abrí `.env.local`. No hice commit, push ni cambios de rama.

## Qué se hizo
- **/login** (criterio 1): `page.tsx` es un Server Component estático con `metadata`. Muestra `<LoginForm />`, un componente cliente (`'use client'`) que usa `useActionState`.
  - El formulario tiene correo, contraseña y dos botones `type="submit" name="intent"`: "Entrar" (`value="entrar"`) y "Crear cuenta" (`value="crear"`).
  - Ambos llaman a la misma Server Action. Elegí el campo que indica la acción porque `useActionState` maneja un único estado de mensajes.
  - El mensaje se muestra con `role="status"` y `aria-live="polite"`, y los botones se desactivan mientras `pending`.
- **Server Action `authenticate`** en `login/actions.ts` (`'use server'`), criterios 2 a 4:
  - Comprueba `intent`, lee correo y contraseña con `FormData.get` y comprueba que son `string`. El correo se valida con `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` tras `trim()`, y la contraseña debe tener al menos 6 caracteres. Todo esto ocurre antes de llamar a Supabase.
  - "Entrar" usa `signInWithPassword`. Si hay error muestra "Correo o contraseña incorrectos."; si no, `redirect('/panel')`.
  - "Crear cuenta" usa `signUp`. Si hay error muestra "No se ha podido crear la cuenta.". Si `!data.session` muestra "Cuenta creada. Revisa tu correo para confirmarla antes de entrar." y no redirige; si trae sesión, `redirect('/panel')`.
  - Nunca se muestra `error.message`. No hay ningún try/catch, así que `redirect` no queda atrapado.
- **/panel** (criterios 5 y 7):
  - La página exterior es estática (título "Tu panel").
  - `<Greeting />` va dentro de `<Suspense fallback="Cargando…">`. Hace `createClient()` y `getClaims()`, hace `redirect('/login')` si no hay claims, y muestra "Hola, {claims.email}" con el botón "Cerrar sesión".
  - El build la marca como ◐ (Partial Prerender).
- **Cerrar sesión** en `panel/actions.ts` (`'use server'`, criterio 6): `getClaims()`; si hay claims, `signOut()`; después `redirect('/login')`.
- **Proxy** (criterios 7 y 9):
  - `src/proxy.ts` exporta `proxy` y `config.matcher` con `"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"`.
  - `updateSession` en `src/lib/supabase/proxy.ts` sigue el patrón pedido:
    - empieza con `let supabaseResponse = NextResponse.next({ request })`;
    - `getAll` lee de `request.cookies`;
    - `setAll(cookiesToSet, headers)` escribe en `request.cookies`, recrea `supabaseResponse`, escribe sus cookies y aplica las cabeceras del segundo argumento;
    - después llama a `getClaims()` y devuelve ese `supabaseResponse`.
  - Si la ruta es `/panel` o `/panel/...` y no hay claims, redirige a `/login`. Copia a la redirección las cookies de `supabaseResponse` y, si existen, `cache-control`, `expires` y `pragma`.
- **Criterios 8 y 10**: `grep -rn -E "getSession|use cache" src` solo encuentra el comentario de la línea 5 de `server.ts` (ver Dudas). `layout.tsx` no se ha tocado y no lee la sesión.

## Resultado literal de lint y build
```
> bolsillo@0.1.0 lint
> eslint

EXIT lint: 0

> bolsillo@0.1.0 build
> next build

▲ Next.js 16.4.6 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 37ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 1187ms
  Running TypeScript ...
  Finished TypeScript in 1332ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6) 
  Generating static pages using 7 workers (2/6) 
  Generating static pages using 7 workers (4/6) 
✓ Generating static pages using 7 workers (6/6) in 480ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /login
└ ◐ /panel


ƒ Proxy (Middleware)

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content

EXIT build: 0
```
("EXIT lint/build" es el `echo $?` que añadí al comando.)

## Documentación usada
Leída por mí:
- `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`
  - Step 1: "A request read can't be part of the static shell, so it always sits behind a `<Suspense>` boundary"; plain `use cache` no puede llamar a `cookies()`.
  - Step 2: "A component that reads the session must sit behind a `<Suspense>` boundary. With Cache Components, reading `cookies()` outside a boundary is a build error." También: "Keep the session read out of a layout's top level".
  - Common pitfalls: "Reading `cookies()` or `headers()` inside a plain `use cache` function. This throws."
  - Step 1 explica además que `redirect()` lanza una excepción para interrumpir el render.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
  - Ubicación: "in the project root, or inside `src` if applicable, so that it is located at the same level as `pages` or `app`".
  - Exports: "either as a default export or named `proxy`".
  - Matcher / Negative matching: sin matcher, el proxy se ejecuta también en `_next/static`, `_next/image` y `public/`; se usa un lookahead negativo.
  - Execution order, Good to know: las Server Functions "are handled as POST requests to the route where they are used… Always verify authentication and authorization inside each Server Function rather than relying on Proxy alone." Por eso `signOut` vuelve a comprobar con `getClaims`.
- `node_modules/next/dist/docs/01-app/02-guides/authentication.md`
  - "2. Validate form fields on the server".
  - "Optimistic checks with Proxy (Optional)".
  - "Creating a Data Access Layer (DAL)".
  - "Server Actions": "Treat Server Actions with the same security considerations as public-facing API endpoints".
- Tipos:
  - `node_modules/@supabase/ssr/dist/main/types.d.ts` (v0.12.7), `SetAllCookies`: el segundo argumento es `headers: Record<string, string>`, con Cache-Control, Expires y Pragma.
  - `node_modules/@supabase/auth-js/dist/module/GoTrueClient.d.ts`:
    - `signUp(): Promise<AuthResponse>`, con `data.session: Session | null`;
    - `signInWithPassword(): Promise<AuthTokenResponsePassword>`;
    - `signOut(): Promise<{ error }>`;
    - `getClaims()` devuelve `data: { claims: JwtPayload } | null`.
    - La doc de `getSession` en ese archivo avisa de no confiar en él y usar `getClaims()`.
  - `lib/types.d.ts`: `JwtPayload.email?: string`.

Pasada por el Orchestrator (no la leí yo):
- supabase.com/docs/guides/auth/server-side/nextjs: usar `getClaims`, no `getSession`, en el servidor; en Next 16 el archivo es `proxy.ts`; devolver el `supabaseResponse` o copiar sus cookies y cabeceras.
- supabase.com/docs/guides/auth/passwords: `signUp` y `signInWithPassword` reciben `{ email, password }`.
- supabase.com/docs/reference/javascript/auth-getclaims.

## Dudas
1. `src/lib/supabase/server.ts:5` ya tenía (desde T-002) el comentario "y nunca dentro de 'use cache' (cacheComponents)". No es una directiva, pero un grep literal de "use cache" lo encuentra. Lo dejé porque el alcance en ese archivo era solo el comentario del catch. ¿Se cambia la redacción?
2. Si `claims.email` no existiera, `/panel` muestra "Hola, usuario". Es solo un caso de reserva.
3. Si `signOut()` devuelve error, se redirige a `/login` igualmente, sin mostrar mensaje.

---

# Informe de Testing (literal)

T-003 · Ronda 1

**Revisado:** cambios sin commit frente a HEAD 4b63cf9.
- Archivos nuevos: src/proxy.ts, src/lib/supabase/proxy.ts, src/app/login/page.tsx, src/app/login/login-form.tsx, src/app/login/actions.ts, src/app/panel/page.tsx, src/app/panel/actions.ts.
- Archivo modificado: src/lib/supabase/server.ts. Solo cambia el comentario del catch, a "src/proxy.ts (updateSession) refresca la sesión."
- README.md (modificado) y .claude/launch.json (sin seguimiento) no son de Develop, como indicaste, y no cuentan como defectos. Tampoco cuento docs/evidencias/T-003-ronda-1.md, que está sin seguimiento y lo crea el Orchestrator.

**Comprobaciones y resultado**
1. **Formulario /login:** cumple. Tiene campos de correo y contraseña. "Entrar" (intent=entrar) llama a signInWithPassword y "Crear cuenta" (intent=crear) llama a signUp. login-form.tsx es 'use client' porque necesita useActionState, y page.tsx es Server Component.
2. **Server Actions y mensajes:** cumple.
   - actions.ts usa 'use server'. Si todo va bien, llama a redirect('/panel').
   - Los errores muestran mensajes genéricos en español ("Correo o contraseña incorrectos.", "No se ha podido crear la cuenta.").
   - No se muestra error.message en ningún sitio (grep en src/ sin resultados).
   - No hay try/catch alrededor de redirect().
3. **Alta sin sesión:** cumple. Si data.session es null, devuelve "Cuenta creada. Revisa tu correo para confirmarla antes de entrar." y no redirige.
4. **Validación en servidor:** cumple. readCredentials se ejecuta antes de createClient() y de cualquier llamada a Supabase. Comprueba que los campos son string, el formato del correo con una regex sencilla (después de trim) y que la contraseña tiene al menos 6 caracteres. También rechaza un intent que no sea válido. Las comprobaciones del cliente (required, minLength) son un extra, no la única defensa.
5. **/panel:** cumple. Greeting está dentro de <Suspense>, lee getClaims y muestra "Hola, {claims.email}" y el botón "Cerrar sesión".
6. **Cerrar sesión:** cumple. panel/actions.ts comprueba con getClaims, llama a signOut() si hay claims y después a redirect('/login').
7. **Redirección sin sesión (revisión estática del código):** cumple.
   - El matcher `/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)` cubre /panel y sus subrutas.
   - En updateSession, si no hay claims (getClaims devuelve claims undefined) e isPanel es verdadero (`path === "/panel" || path.startsWith("/panel/")`), entra en la rama de redirección.
   - Esa rama hace NextResponse.redirect a una URL con pathname "/login" y search vacío.
   - Además, Greeting en /panel vuelve a comprobar getClaims y llama a redirect("/login") si no hay claims.
   - La prueba con la app en marcha queda como comprobación manual del usuario. No arranqué servidores ni usé curl.
8. **Solo getClaims:** cumple. grep de getSession en src/ sin resultados.
9. **Proxy:** cumple.
   - src/proxy.ts exporta proxy y config.matcher con el patrón negativo pedido.
   - setAll reconstruye supabaseResponse, copia las cookies y aplica las cabeceras que recibe.
   - updateSession devuelve ese supabaseResponse.
   - En la redirección se copian las cookies y las cabeceras cache-control, expires y pragma.
10. **cacheComponents:** cumple.
    - 'use cache' solo aparece dentro de un comentario en server.ts. No se usa como directiva en ningún archivo.
    - layout.tsx no lee la sesión.
    - Las cookies solo se leen en Greeting (dentro de Suspense), en las Server Actions y en el proxy.
11. **Variables, claves y dependencias:** cumple.
    - src/ solo usa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. No hay referencias a secret ni service_role.
    - git diff de package.json, package-lock.json, next.config.ts, AGENTS.md y public/ vacío.
    - No abrí .env.local.
12. **npm run lint:** sin errores ni avisos.
13. **npm run build:** compila bien y TypeScript no da errores. Las rutas que aparecen son ○ /, ○ /_not-found, ○ /login y ◐ /panel (Partial Prerender). También aparece "ƒ Proxy (Middleware)".
14. **Documentación leída:** no tengo la entrega de Develop, así que no puedo comprobar este criterio. Revisa en la entrega que cita la documentación que leyó. El código sigue el patrón de la guía de Supabase SSR y Next.js (proxy y getClaims).
15. **TypeScript:** no hay `any`. Los estados usan tipos con unión discriminada.
16. **Móvil y escritorio:** revisado solo en el código. El contenedor usa max-w-sm con px-6. Los botones van en columna en móvil y en fila desde sm. El correo largo usa break-all. Es adecuado para unos 375 px.
17. **Alcance:** no hay cambios fuera de alcance. No hay movimientos, recuperación de contraseña, OAuth, redirección de /login a /panel ni enlaces en la portada.

**Defectos:** ninguno.

**Veredicto:** Aprobado.

---

# Nota del Orchestrator

Sobre el punto 14 del informe de Testing: la entrega de Develop (arriba) incluye la sección "Documentación usada" con rutas y secciones concretas de la documentación local de Next.js y de los tipos de @supabase/ssr y @supabase/auth-js, y separa lo que le pasó el Orchestrator. El criterio 13 de la asignación se cumple.
