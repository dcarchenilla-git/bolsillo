# T-003 · Ronda 3

## Motivo de la ronda (decidido por el usuario)

Tras confirmar en su prueba manual que la sesión se mantiene al visitar /login, el usuario pidió añadir la redirección de /login a /panel cuando ya hay sesión, solo eso, comprobando la sesión con getClaims() y respetando cacheComponents.

## Entrega de Develop (literal)

T-003 · Ronda 3

**Archivos cambiados**
- C:\ia\claude\bolsillo\src\app\login\page.tsx
- C:\ia\claude\bolsillo\src\lib\supabase\proxy.ts

No he cambiado nada más. No he tocado el formulario (login-form.tsx), las Server Actions (login/actions.ts, panel/actions.ts), /panel, la portada, server.ts, src/proxy.ts, next.config.ts ni las dependencias. No he hecho commits ni push. No he arrancado servidores (había un preview server en marcha, pero no lo he usado). No he abierto .env.local.

**Qué se hizo**

1. **En la página (login/page.tsx).**
   - Añadí un componente `RedirectIfSignedIn` metido en `<Suspense fallback={null}>`. Va como hermano del bloque del formulario, al final del `<main>`.
   - Hace `await connection()`, luego `createClient()` y `supabase.auth.getClaims()`. Si hay claims, llama a `redirect("/panel")`; si no, devuelve `null`.
   - El formulario, el título y las clases no cambian. Siguen fuera del `<Suspense>`, así que forman parte del shell estático y sin sesión se ven igual que antes. El fallback es `null`, así que no aparece ningún "Cargando".

2. **En el proxy (src/lib/supabase/proxy.ts).**
   - Antes había un único `if (isPanel && !claims)`. Ahora se calcula un destino:
     - `/login` si es /panel y no hay claims (igual que antes);
     - `/panel` si es `GET /login` y hay claims.
   - El bloque de redirección es el mismo de antes. Copia las cookies y las cabeceras cache-control, expires y pragma. Solo cambia `url.pathname = target`.
   - Actualicé el comentario de cabecera.
   - El comportamiento de /panel y el manejo de cookies y cabeceras no cambian.
   - Comprobé que `getSession` no aparece en ningún archivo de src. `'use cache'` solo sale en el comentario que ya había en server.ts:5; no hay ninguna directiva en ninguna variante.

**Por qué en la página y también en el proxy (criterio 4)**
- **authentication.md, "Optimistic checks with Proxy (Optional)":**
  - El ejemplo oficial hace exactamente esto: "5. Redirect to /dashboard if the user is authenticated" para las rutas públicas como /login.
  - Además, el texto dice que el Proxy "is a good way to centralize redirect logic".
  - Nuestro proxy ya calcula `getClaims()`, así que no añade ninguna llamada nueva.
- **streaming.md, "The HTTP contract > Status codes":** "a `redirect()` mid-stream becomes a client-side redirect rather than an HTTP redirect header". redirect.md dice lo mismo ("When used in a streaming context, this will insert a meta tag to emit the redirect on the client side").
  - Como el componente de la página va dentro de `<Suspense>`, su redirect sería del lado del cliente: primero llega el formulario y después salta a /panel.
  - El proxy responde con un 307 antes de renderizar (proxy.md: "Proxy executes before routes are rendered"; redirect.md, Behavior: "If you'd like to redirect before the render process, use ... Proxy").
- **Por qué mantengo también la página:** authentication.md dice que el Proxy "should not be your only line of defense". Por eso hago lo mismo que en /panel, que comprueba en el proxy y en la página.
- **Por qué solo GET en el proxy:** el formulario envía su Server Action con un POST a /login. Si se redirigiera ese POST con un 307, la acción acabaría en /panel y podría fallar. Por ejemplo, alguien que tiene una pestaña vieja de /login abierta y ya entró en otra pestaña. Con un POST, el proxy no redirige y la acción funciona como hoy (al final hace `redirect("/panel")`). Esto es una decisión mía; ver Dudas.

**Ruta /login en el build: pasa de ○ a ◐**
- Ahora aparece como `◐ /login` (Partial Prerender); antes era `○ /login`.
- El motivo: `RedirectIfSignedIn` lee cookies y llama a `connection()`, así que es contenido que depende de la petición. Con cacheComponents, ese contenido no puede ir en el shell estático.
- El título y el formulario siguen prerenderizados como HTML estático. Solo el hueco del `<Suspense>` (que no pinta nada) se resuelve en cada petición.
- authentication-with-cache-components.md, "Step 2", lo explica así: "Anything outside it prerenders into the static shell ... Only the section behind the boundary waits for the request".
- La leyenda del build lo define así: "◐ prerendered as static HTML with dynamic server-streamed content".

**Resultado literal de lint y build**
```
> bolsillo@0.1.0 lint
> eslint

LINT EXIT 0

> bolsillo@0.1.0 build
> next build

▲ Next.js 16.4.6 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 21ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 617ms
  Running TypeScript ...
  Finished TypeScript in 1152ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6) 
  Generating static pages using 7 workers (2/6) 
  Generating static pages using 7 workers (4/6) 
✓ Generating static pages using 7 workers (6/6) in 459ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ◐ /login
└ ◐ /panel


ƒ Proxy (Middleware)

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content

BUILD EXIT 0
```
(Las líneas "LINT EXIT" y "BUILD EXIT" son de mi `echo $?`.)

**Documentación usada (leída por mí, en node_modules/next/dist/docs/01-app/)**
- **02-guides/authentication-with-cache-components.md**
  - Introducción: la lectura de la sesión va detrás de `<Suspense>`.
  - "Step 1": "Validating it compares a token's expiry against the current time", es decir, depende de la hora.
  - "Step 2": "reading `cookies()` outside a boundary is a build error" y lo de que el shell estático queda fuera del boundary.
  - "Common pitfalls": no leer cookies en `use cache`.
- **02-guides/authentication.md**
  - "Authorization" (comprobaciones optimistas y seguras).
  - "Optimistic checks with Proxy (Optional)": el ejemplo con el paso 5, que redirige al usuario autenticado desde las rutas públicas, y la advertencia "should not be your only line of defense".
  - Nota de "Creating a Data Access Layer (DAL)" sobre las rutas estáticas y el Proxy.
- **03-api-reference/04-functions/redirect.md**
  - Párrafo inicial sobre el "streaming context": inserta un meta tag y la redirección pasa en el cliente.
  - "Behavior": "redirect before the render process, use ... Proxy".
  - "Example > Server Component": lanza NEXT_REDIRECT y "terminates rendering of the route segment".
  - "The `type` parameter has no effect when used in Server Components".
- **02-guides/streaming.md, "The HTTP contract > Status codes"**: "a `redirect()` mid-stream becomes a client-side redirect rather than an HTTP redirect header". Esto es lo que hay sobre redirect() dentro de `<Suspense>` durante el streaming.
- **03-api-reference/04-functions/connection.md**
  - Ejemplo "prerendering stops here / the following code only runs at request time".
  - "Good to know": con Cache Components, el componente va dentro de `<Suspense>`; se usa `connection()` "only when rendering should wait for a real user request", que es el caso de leer la sesión.
  - Esto respalda la lección de la ronda 2: getClaims usa Date.now(), como confirmó Testing en la ronda 2.
- **03-api-reference/03-file-conventions/proxy.md**
  - Introducción: "Proxy executes before routes are rendered".
  - "NextResponse": redirect y cookies.
  - "Using Cookies".
  - "Execution order".

**Dudas**
1. **La condición de solo GET en el proxy** no está en el ejemplo de la documentación. La añadí para no redirigir el POST de la Server Action del formulario. Si preferís el ejemplo literal (cualquier método), es quitar `&& request.method === "GET"`. En la página no hace falta, porque las Server Actions no renderizan esa página de la misma manera.
2. **Una mejora de rendimiento en la página, con la que no hice nada:**
   - Con la redirección en el proxy, la comprobación de la página casi nunca va a llegar a redirigir. Solo lo haría si el proxy no se ejecuta, o si el token cambia entre el proxy y el renderizado.
   - Aun así, cada GET /login sin sesión hace un `getClaims()` más en el servidor.
   - Sin sesión, `getClaims` sale enseguida sin llamar a la red (lo vio Testing en la ronda 2, GoTrueClient.js:5581). Con sesión, el proxy redirige antes y la página no llega a renderizarse.
   - No lo he optimizado.
3. **Falta la prueba manual del usuario,** porque no he arrancado servidores:
   - con sesión abierta, abrir /login: debe llevar a /panel sin que se vea el formulario, porque el 307 lo da el proxy;
   - sin sesión, /login muestra el formulario;
   - entrar, crear cuenta y cerrar sesión siguen funcionando;
   - en modo dev no aparece ningún aviso nuevo de Blocking Route en /login.

---

# Informe de Testing (literal)

T-003 · Ronda 3

**Revisado:** cambios sin commit frente a HEAD 4b63cf9. No hay commit nuevo.
- Solo han cambiado dos archivos desde la ronda 2:
  - C:\ia\claude\bolsillo\src\app\login\page.tsx, modificado a las 09:54:37.
  - C:\ia\claude\bolsillo\src\lib\supabase\proxy.ts, modificado a las 09:54:42.
- Cómo lo he comprobado: el informe de la ronda 2 se guardó a las 09:44. Lo demás tiene la hora que ya figuraba en las evidencias anteriores:
  - login/actions.ts, login/login-form.tsx, panel/actions.ts y src/proxy.ts: 09:21.
  - server.ts: 09:21. `git diff` muestra solo el comentario de la ronda 1.
  - panel/page.tsx: 09:40, el cambio de la ronda 2. Su contenido coincide con lo descrito en esa ronda.
  - layout.tsx y la portada: 00:54. next.config.ts: 00:42. package.json: 08:59.
- No cuento README.md, .claude/launch.json ni docs/evidencias/*, porque no son de Develop.
- Límite: los archivos nuevos no están en git y no hay copia literal de las versiones anteriores. La comparación de los dos archivos cambiados se basa en las horas y en la descripción de las rondas 1 y 2, no en un diff.

**Comprobaciones y resultado**

1. **Con sesión, /login lleva a /panel; sin sesión, formulario igual (criterio 1): cumple.**
   - El título, `<LoginForm />` y las clases están igual que antes y siguen fuera del Suspense (page.tsx:14-20).
   - `RedirectIfSignedIn` va en `<Suspense fallback={null}>` (líneas 21-23). Devuelve `null`, así que sin sesión no añade nada visible.
   - En el proxy, `isLoginPage && claims` hace que `target` sea "/panel" (proxy.ts:41, 45).

2. **Solo getClaims() (criterio 2): cumple.**
   - getClaims() en page.tsx:35 y proxy.ts:35.
   - Buscar `getSession` en src no da ningún resultado.

3. **cacheComponents (criterio 3): cumple.**
   - La lectura de sesión está dentro de `<Suspense>`.
   - `await connection()` (page.tsx:33) va antes de `createClient()` (34) y de `getClaims()` (35).
   - 'use cache' solo aparece en el comentario de server.ts:5, nunca como directiva.
   - En el build sale `◐ /login`, una ruta válida. Pasa de ○ a ◐, como era de esperar.

4. **Proxy (criterio 4): cumple.**
   - El cambio es mínimo. La condición `if (isPanel && !claims)` ahora calcula `target` (líneas 43-45). El bloque de redirección es el de antes, solo que usa `url.pathname = target`.
   - /panel sin claims sigue yendo a "/login" con `search = ""`. Esa comprobación va primero (`if`), así que su prioridad no cambia.
   - Las dos redirecciones pasan por el mismo bloque. Las dos copian todas las cookies de `supabaseResponse` (líneas 53-55) y las cabeceras cache-control, expires y pragma (56-59).
   - setAll, getAll y la llamada a getClaims justo después de createServerClient no han cambiado.

5. **Solo GET /login en el proxy: es correcto.**
   - proxy.md:251 dice que las Server Functions "are handled as POST requests to the route where they are used". La acción `authenticate` se envía como POST /login.
   - Si se redirigiera ese POST con un 307, se reenviaría a /panel con el mismo método y cuerpo, y la acción no se ejecutaría.
   - Al dejar pasar el POST, la acción funciona como antes y termina con su propio `redirect("/panel")`.
   - Las navegaciones del cliente y los prefetch de /login son GET, así que también se redirigen.
   - La página mantiene su propia comprobación, como pide authentication.md:1121 ("should not be your only line of defense").

6. **Riesgo de bucle entre /login y /panel: no veo ninguno en condiciones normales.**
   - Proxy y páginas usan las mismas cookies y la misma comprobación, `getClaims()` con @supabase/ssr. Si el proxy refresca el token, escribe las cookies nuevas tanto en la petición (`request.cookies.set` y `NextResponse.next({ request })`) como en la redirección. Así, /panel recibe la sesión ya refrescada.
   - Con sesión válida, /panel no redirige ni en el proxy ni en la página.
   - Sin sesión, /login no redirige ni en el proxy ni en la página.
   - Solo podría haber idas y vueltas en un caso raro: que getClaims funcionara en el proxy y fallara en la página de /panel en cada petición (por ejemplo, por un fallo de red persistente hacia Supabase solo desde el render). Es poco probable, no es un defecto, y el ejemplo oficial (authentication.md:1056-1068) tiene la misma estructura.

7. **La documentación citada existe y dice lo que afirma Develop.**
   - authentication.md:
     - 1026: "Optimistic checks with Proxy (Optional)".
     - 1030: "centralize redirect logic".
     - 1061: "5. Redirect to /dashboard if the user is authenticated", aplicado a publicRoutes que incluyen '/login'.
     - 1121: "should not be your only line of defense".
   - redirect.md:
     - 12: "When used in a streaming context, this will insert a meta tag to emit the redirect on the client side".
     - 56: "redirect before the render process, use ... Proxy".
   - streaming.md, sección "Status codes" (615-617): "a `redirect()` mid-stream becomes a client-side redirect rather than an HTTP redirect header".
   - proxy.md:
     - 15: "Proxy executes before routes are rendered".
     - 238: "Execution order".
     - 251-253: la nota sobre las Server Functions.

8. **No cambia nada más (criterios 5 y 6): cumple.**
   - `git diff --quiet HEAD -- package.json package-lock.json next.config.ts AGENTS.md src/app/layout.tsx src/app/page.tsx public` devuelve 0, es decir, sin cambios.
   - El formulario, las Server Actions, /panel, src/proxy.ts y server.ts no se han tocado (ver horas arriba).
   - No hay referencias a secret ni service_role. No he abierto .env.local.

9. **Lint y build (criterio 7): cumple.**
   - `npm run lint`: EXIT 0, sin avisos.
   - `npm run build`: EXIT 0 y TypeScript sin errores. Rutas: ○ /, ○ /_not-found, ◐ /login, ◐ /panel y ƒ Proxy (Middleware).

10. **Documentación local citada (criterio 8): cumple.** Develop da rutas y secciones concretas, y las he verificado en el punto 7.

11. **TypeScript, Server Components y móvil: cumple.**
    - No hay `any`.
    - page.tsx sigue siendo Server Component y no hay 'use client' nuevo.
    - El diseño no cambia.

**Queda solo para la prueba manual del usuario** (no he arrancado servidores ni usado curl):
1. Con la sesión abierta, abrir /login: debe ir directo a /panel sin que se vea el formulario.
2. Sin sesión, /login debe mostrar el formulario como antes.
3. "Entrar", "Crear cuenta" y "Cerrar sesión" deben seguir funcionando. Hay que mirar sobre todo "Entrar" desde una pestaña de /login abierta antes de iniciar sesión en otra pestaña.
4. Sin sesión, /panel debe seguir llevando a /login.
5. En `npm run dev` no debe aparecer ningún aviso nuevo de "Blocking Route" en /login.

**Defectos:** ninguno.

**Veredicto:** Aprobado.
