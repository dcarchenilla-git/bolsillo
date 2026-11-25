# T-003 · Ronda 2

## Defecto que abre la ronda (reportado por el usuario, prueba manual en `npm run dev`)

Registro, acceso, mensaje de error y saludo en /panel funcionan. Al entrar en /panel aparece un aviso "Blocking Route" / "Server": "Next.js encountered the unstable value Date.now() while prerendering. This value can change between renders, so it must be either prerendered or computed later", señalando src\app\panel\page.tsx (22:9) @ PanelPage, en la línea de <Greeting />. Precisión posterior del usuario: "El aviso fue al registrarme". Segunda precisión del usuario (llegó cuando Testing ya estaba revisando, y se le reenvió): "al entrar directamente no, es decir al pulsar en crear cuenta, no al pulsar en entrar".

## Entrega de Develop (literal)

T-003 · Ronda 2

He añadido `await connection()` al principio de `Greeting` en `/panel`, que es la corrección que da la documentación para este aviso. `npm run lint` y `npm run build` pasan. No he comprobado que el aviso desaparezca en `npm run dev`: no arranqué ningún servidor, como pedía la tarea. Esa prueba queda para el usuario. Un hook avisó de que había un servidor de vista previa en marcha y pedía verificarlo en el navegador; no lo hice por la misma regla.

## Archivos cambiados
- `C:\ia\claude\bolsillo\src\app\panel\page.tsx` es el único archivo tocado en esta ronda. Tiene dos cambios:
  - Línea 4: `import { connection } from "next/server";`
  - En `Greeting()`, antes de `createClient()`, un comentario de dos líneas y la llamada:
```tsx
  // Supabase compara la caducidad del token con Date.now(). connection()
  // hace que eso se ejecute solo con la petición real, no al prerenderizar.
  await connection();
```
- Lo demás sigue como en la ronda 1. `README.md` y `.claude/launch.json` no son míos. `next.config.ts`, `package.json` y `.env.local` no se han tocado ni abierto. No hay commits, push ni cambios de rama.

## Causa
- **Qué pasaba:**
  - Para comprobar la sesión, Supabase mira la hora actual con `Date.now()` y la compara con la caducidad del token.
  - Con Cache Components y `partialPrefetching: true` (está activado en `next.config.ts`), Next también prerenderiza una "App Shell" de cada página.
  - Si la página lee `cookies()`, esa App Shell incluye los datos de la sesión, y se guarda en el navegador para cada sesión.
  - Por eso `await cookies()` no detiene ese prerenderizado: las cookies se resuelven dentro de él y el código sigue ejecutándose. Al llegar a `Date.now()` dentro de `getClaims()`, Next lo detecta como valor que cambia. Estar dentro de `<Suspense>` no lo evita, porque el problema no es dónde está el componente, sino que se ejecute durante un prerenderizado.
  - `connection()` sí detiene todos los prerenderizados. Según la documentación, el código que va detrás se excluye "from every prerender, whether the prerender runs at build time or for a prefetch". Así, `Date.now()` solo se ejecuta con la petición real.
- **Dónde llama Supabase a `Date.now()`** (auth-js 2.119.2, `@supabase/ssr` 0.12.7). Lo he leído en el código; las líneas de `dist/main` son las de la versión CommonJS:
  1. `node_modules/@supabase/auth-js/dist/module/GoTrueClient.js` ~2538 (`dist/main` ~2541), en `__loadSession`: `currentSession.expires_at * 1000 - Date.now() < EXPIRY_MARGIN_MS`. `getClaims()` (~5575) llama primero a `getSession()`, y este llega a `__loadSession`.
  2. `node_modules/@supabase/auth-js/dist/module/lib/helpers.js` ~422 (`dist/main` ~458): `validateExp`, con `Math.floor(Date.now() / 1000)`. `getClaims` lo llama en ~5590.
  3. `GoTrueClient.js` ~5484, en `fetchJwk`, si el token usa claves asimétricas.
  - No puedo confirmar cuál de las tres saltó primero, porque no ejecuté la app. Lo más probable es la 1, que es la primera del recorrido.
  - Tampoco tengo la página `blocking-prerender-current-time`: no está en `node_modules/next/dist/docs` (no existe la carpeta `messages`). Solo la nombran otras páginas.
  - Que la App Shell sea el prerenderizado concreto que detectó el aviso es mi deducción a partir de la documentación. No lo he visto en ejecución.
- **¿Afecta a producción (`next build`, Vercel)?**
  - El build de esta ronda pasa sin errores y `/panel` sale como ◐ (Partial Prerender). La ronda 1 también pasaba, así que el build no detectaba este problema.
  - Según la documentación, el aviso es una indicación del modo desarrollo ("The dev overlay surfaces a ... blocking-prerender-current-time insight"). No es un fallo para el usuario final.
  - Aun así, sin la corrección la App Shell de `/panel` podía calcularse con una hora distinta de la de la petición real. Con `connection()` eso ya no puede ocurrir.

## Qué se hizo
- He aplicado la primera solución de la documentación, "Generate on every request" (`await connection()`).
- He descartado la segunda, "Cache the value" (`'use cache'`), porque está prohibida y además no sirve para datos de sesión.
- Siguen igual el `<Suspense>`, el `redirect('/login')`, el saludo, el botón de cerrar sesión, el proxy y las Server Actions.
- Consecuencia: el saludo ya no viene precargado en la App Shell. Al navegar a `/panel` se ve un momento "Cargando…" y después llega el saludo.

## Resultado literal de lint y build
```
> bolsillo@0.1.0 lint
> eslint

EXIT lint: 0

> bolsillo@0.1.0 build
> next build

▲ Next.js 16.4.6 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 22ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 525ms
  Running TypeScript ...
  Finished TypeScript in 1135ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6) 
  Generating static pages using 7 workers (2/6) 
  Generating static pages using 7 workers (4/6) 
✓ Generating static pages using 7 workers (6/6) in 481ms
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
("EXIT" es el `echo $?` que añadí al comando.)

## Documentación usada (todo leído por mí en esta ronda)
- `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`, sección "Random values and timestamps":
  - Para valores por petición, "defer to request time by calling `connection()` before these operations, and wrap the component in `<Suspense>`".
  - El dev overlay muestra el aviso blocking-prerender-current-time, con las dos soluciones citadas arriba.
- `node_modules/next/dist/docs/01-app/02-guides/building.md` ~441: `new Date()` sigue produciendo errores de prerenderizado y enlaza a `/docs/messages/blocking-prerender-current-time`.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md`: Usage ("prerendering stops here") y Good to know: con Cache Components va dentro de `<Suspense>`, y el código que sigue a `connection()` se ejecuta en el momento de la petición.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/io.md`:
  - "How `io()` differs from `connection()`": fuera de caché los dos excluyen el código "from every prerender, whether the prerender runs at build time or for a prefetch".
  - "When you don't need `io()`" dice que `cookies()` ya es el punto de suspensión. Eso vale para el build normal, pero no explica la App Shell que incluye la sesión (ver abajo).
- `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`, entera:
  - Step 1: validar la sesión "compares a token's expiry against the current time", así que la lectura depende de la petición y de la hora.
  - Step 2: la sesión va dentro de `<Suspense>`.
  - Step 6: una ruta que lee la sesión produce una App Shell por sesión.
- `node_modules/next/dist/docs/01-app/02-guides/optimizing-prefetching.md`:
  - Introducción, punto 1: la App Shell incluye la interfaz de la sesión en rutas que leen `cookies()`.
  - Sección "use cache: private": pone como ejemplo exactamente "an authentication helper may compare `Date.now()` with a token's expiration".
- `node_modules/next/dist/docs/01-app/04-glossary.md`, "App Shell" y "Navigation stages".
- Código de Supabase: las rutas y líneas citadas en "Causa".

## Dudas
1. **`io()` en lugar de `connection()`:** `io.md` dice "Prefer `io()` over `connection()`" (de `next/cache`, desde la 16.3). Fuera de caché hacen lo mismo. Elegí `connection()` porque es la que propone `08-caching.md` para valores por petición y la que pediste revisar, y porque `io.md` la reserva para cuando hay que esperar a una petición real, como al leer la sesión. ¿Se cambia?
2. **La alternativa sería `'use cache: private'`:** es lo que proponen la guía de autenticación y `optimizing-prefetching.md` para precargar la sesión en la App Shell. No la usé porque la tarea prohíbe `'use cache'`. Si un día se quiere esa precarga, haría falta autorización.
3. **Solo protege `Greeting`:** puse `connection()` en `Greeting` y no en `createClient()` de `server.ts`, para que el cambio sea mínimo y no afecte a las Server Actions. Cualquier Server Component futuro que lea la sesión tendrá que hacer lo mismo.
4. **Pendiente de prueba:** el usuario debe abrir `/panel` en `npm run dev` y confirmar que el aviso ya no aparece.

## Respuesta de Develop a la precisión del usuario (literal)

T-003 · Ronda 2 · Anexo (precisión del usuario: "El aviso fue al registrarme")

Este anexo completa la entrega anterior de la ronda 2; no la sustituye. Con este flujo la causa y la corrección siguen igual, y no he cambiado más código.

### Archivos cambiados
- `C:\ia\claude\bolsillo\src\app\panel\page.tsx`, igual que en la entrega anterior: `import { connection } from "next/server"` y `await connection()` como primera línea de `Greeting`.
- Lint y build son los de la entrega anterior (los dos con EXIT 0). No los he repetido porque desde entonces no ha cambiado ningún archivo.

### Causa, con el flujo de registro
1. **El clic en "Crear cuenta":** la Server Action `authenticate` llama a `signUp`, y esta escribe las cookies de sesión. Luego llama a `redirect('/panel')`.
   - Según `redirect.md` (línea 12): "In a Server Action, `redirect` performs a client-side navigation when JavaScript is available".
   - Next pinta `/panel` en esa misma respuesta, ya con las cookies recién escritas.
2. **Por qué aparece justo ahí:** es la primera vez que `/panel` se pinta con una sesión real.
   - Si no hay cookie de sesión, `getClaims()` termina enseguida y nunca llega a `Date.now()`. En `GoTrueClient.js` (~5575), si `getSession()` no devuelve sesión, sale sin llamar a `validateExp`.
   - Con cookie de sesión, el código pasa por `Date.now()`: en `__loadSession` (~2538), en `validateExp` (`helpers.js` ~422) y quizá en `fetchJwk` (~5484).
   - Sin sesión, además, el proxy manda a `/login` antes de pintar la página.
3. **Qué es la etiqueta "Blocking Route":** según `instant-navigation.md` ("Validate instant navigation", líneas 103-105, 203 y 230), en desarrollo Next revisa cada página. Esa revisión:
   - comprueba tanto la carga directa como la navegación desde otra página;
   - "runs on every page load using the real request from your browser";
   - muestra el aviso "blocking-route" en el panel de errores de desarrollo.
   - Esa revisión prepara una versión anticipada de la página para cada sesión. En ella las cookies ya están disponibles, así que `await cookies()` no frena el código y Next ve el `Date.now()` de Supabase.

### ¿Aparece también al entrar en /panel directamente?
- **Sin sesión:** no. El proxy redirige a `/login` y `Greeting` ni siquiera llega a leer la sesión.
- **Con sesión** (recargar `/panel`, o escribir la dirección después de entrar): lo más probable es que sí. Se ejecuta el mismo código con la misma cookie, y la documentación dice que la revisión se hace en cada carga de página.
- **No lo he comprobado:** no arranqué servidores. Tampoco he encontrado en la documentación local nada que diga si la página que se pinta tras la Server Action se revisa de forma distinta a una visita directa.
- **Por qué el usuario lo vio al registrarse:** probablemente porque era su primera visita a `/panel` con sesión, no porque el registro tenga algo especial.

### Qué cambia en la corrección
- Nada. `await connection()` va antes de `createClient()` y de `getClaims()`, así que frena la versión anticipada de la página antes de cualquier `Date.now()`, venga la visita de la Server Action o sea directa.
- Según `io.md`, el código que va después "is excluded from every prerender, whether the prerender runs at build time or for a prefetch".
- No hace falta tocar `login/actions.ts`: el `Date.now()` que se detecta es el de la lectura de la sesión en `/panel`, no el de `signUp`. `signUp` se ejecuta dentro de una Server Action, que siempre va con la petición real.

### Pruebas manuales para el usuario (`npm run dev`)
1. Crear una cuenta nueva o entrar con una existente: comprobar que ya no sale el aviso al llegar a `/panel`.
2. Con la sesión abierta, recargar `/panel` (F5): comprobar que tampoco sale.
3. Cerrar sesión y abrir `/panel`: debe redirigir a `/login`.

### Documentación usada en este anexo (leída por mí)
- `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`: "Validate instant navigation", el bloque "How validation simulates different navigations" y las líneas 203 y 230.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`: líneas 12 y 215.
- `node_modules/next/dist/docs/01-app/01-getting-started/` (archivo de mutating data): "Redirect after a mutation".
- `node_modules/@supabase/auth-js/dist/module/GoTrueClient.js`, `getClaims` (~5575-5601).

### Dudas
- Las de la entrega anterior siguen abiertas: `io()` frente a `connection()`, `'use cache: private'` y que la corrección solo cubre `Greeting`.
- Nueva: ¿el aviso sale también al recargar `/panel` con sesión? Es lo que espero, pero solo puede confirmarlo la prueba manual.

---

# Informe de Testing (literal)

T-003 · Ronda 2

**Revisado:** cambios sin commit frente a HEAD 4b63cf9. No hay commit nuevo.
- Lo único que ha cambiado desde la ronda 1 es C:\ia\claude\bolsillo\src\app\panel\page.tsx:
  - línea 4: `import { connection } from "next/server";`
  - líneas 31-33: un comentario y `await connection();` como primera instrucción de `Greeting`.
- Cómo lo he comprobado: src/app/panel y src/app/login no tienen seguimiento en git, así que no se pueden comparar con git diff. He comparado las horas de modificación y el contenido con el informe de la ronda 1:
  - panel/page.tsx se modificó a las 09:40.
  - El resto de archivos nuevos (src/proxy.ts, src/lib/supabase/proxy.ts, login/*, panel/actions.ts) se modificaron a las 09:21, antes del informe de la ronda 1 (09:24).
  - server.ts (09:21) solo tiene el cambio de comentario de la ronda 1, que he visto en el diff.
- No cuento README.md, .claude/launch.json ni docs/evidencias/*, porque no son de Develop.

**Comprobaciones y resultado**
1. **Alcance del cambio:** cumple. Solo cambia panel/page.tsx. `git diff --quiet HEAD -- package.json package-lock.json next.config.ts AGENTS.md src/app/layout.tsx public` sale con código 0, es decir, sin cambios. No hay dependencias nuevas.
2. **La documentación respalda la corrección:** cumple.
   - 08-caching.md, "Random values and timestamps" (líneas 329-366): "To generate unique values per request, defer to request time by calling `connection()` before these operations, and wrap the component in `<Suspense>`". El aviso blocking-prerender-current-time del dev overlay propone esa misma solución.
   - connection.md: "prerendering stops here / the following code only runs at request time". En Good to know, con Cache Components el componente debe ir dentro de `<Suspense>`.
   - Esa misma página recomienda `io()` y deja `connection()` "only when rendering should wait for a real user request". Leer la sesión es justo ese caso, así que la elección es válida. Es la duda 1 de Develop y no la cuento como defecto.
   - io.md, línea 87: fuera de caché, `connection()` e `io()` excluyen el código siguiente "from every prerender, whether the prerender runs at build time or for a prefetch".
   - io.md, línea 82, dice que `cookies()` ya es el punto de suspensión. Develop explica por qué no basta aquí: con Partial Prefetching, la App Shell incluye los datos de sesión. instant-navigation.md, línea 548, lo confirma: "Session data from `cookies()` or `headers()` already lands in the App Shell". La explicación es coherente con la documentación, pero es una deducción.
   - instant-navigation.md, líneas 105, 203 y 230: en desarrollo se valida cada página, el aviso aparece como "blocking-route" y la validación "runs on every page load using the real request from your browser". Coincide con la etiqueta "Blocking Route" que vio el usuario.
3. **Date.now() en el camino de getClaims:** confirmado (@supabase/auth-js 2.119.2, dist/module).
   - GoTrueClient.js:5579: `getClaims` llama a `getSession()` cuando no se le pasa un token. Si no hay sesión, sale en la línea 5581 sin llegar más lejos.
   - Con sesión, `__loadSession` usa `Date.now()` en la línea 2538, y `validateExp` lo usa en lib/helpers.js:422 (llamado desde GoTrueClient.js:5590). `fetchJwk` también lo usa en la línea 5484.
4. **connection() dentro de Suspense y antes de leer la sesión:** cumple. `Greeting` se renderiza dentro de `<Suspense>` (page.tsx:18-24), y `await connection()` (línea 33) va antes de `createClient()` (línea 34) y de `getClaims()` (línea 35).
5. **El resto de criterios de T-003 se siguen cumpliendo:**
   - Ninguna búsqueda de `getSession` o `error.message` en src encuentra nada.
   - 'use cache' solo aparece en el comentario de server.ts:5, nunca como directiva.
   - layout.tsx no lee la sesión.
   - El proxy y las Server Actions no han cambiado desde la ronda 1. Los mensajes siguen siendo genéricos, y la validación en servidor (`readCredentials`) se hace antes de llamar a Supabase.
   - No hay referencias a la secret key ni a service_role. No he abierto .env.local.
6. **npm run lint:** EXIT 0, sin errores ni avisos.
7. **npm run build:** EXIT 0 y TypeScript sin errores. Las rutas son ○ /, ○ /_not-found, ○ /login y ◐ /panel (Partial Prerender), más ƒ Proxy (Middleware).
8. **TypeScript, Server Components y móvil:** sin cambios respecto a la ronda 1. No hay `any` ni 'use client' nuevos.

**Sobre la precisión del usuario (el aviso salió con "Crear cuenta" y no con "Entrar")**
- **Qué hace el código:**
  - En C:\ia\claude\bolsillo\src\app\login\actions.ts los dos caminos acaban igual: `redirect("/panel")` en las líneas 59 y 72, sin try/catch, desde la misma Server Action.
  - Mirando nuestro código no veo ninguna diferencia que explique por qué el aviso solo salió con signUp. En los dos casos `/panel` se pinta con cookies de sesión, y `getClaims` pasa por `Date.now()`.
  - Con la explicación de Develop, el aviso también debería haber salido con "Entrar" antes de la corrección. Que no saliera no encaja con su hipótesis de "primera visita con sesión", salvo que "Crear cuenta" fuera la primera vez que el usuario llegó a /panel con sesión.
- **Posibles explicaciones, sin comprobar:** que el overlay solo muestre el aviso una vez por sesión del servidor de desarrollo, o que cambie el contenido de la sesión que devuelve signUp frente a signInWithPassword (por ejemplo, el tamaño de la cookie o los datos del usuario).
- **Qué está confirmado:** que hay `Date.now()` en el camino de `getClaims` cuando hay sesión, y que la documentación indica `connection()` antes de `Date.now()`, dentro de `<Suspense>`, como solución.
- **Qué no está confirmado:** por qué el aviso solo salió tras signUp, y qué prerenderizado concreto lo detectó (la App Shell es una deducción de Develop).
- **¿La corrección cubre los dos caminos?** Sí, por cómo está escrito el código. `connection()` va antes de cualquier lectura de sesión en `Greeting`, y `Greeting` es el único Server Component que lee la sesión. Da igual que se llegue por signUp, por signInWithPassword o por una visita directa. Las Server Actions y el proxy se ejecutan siempre con la petición real y no se prerenderizan.

**Pendiente de prueba manual (no la puede hacer Testing):** que el aviso ha desaparecido en modo desarrollo solo puede confirmarlo el usuario con npm run dev. No he arrancado servidores ni usado curl. Pruebas recomendadas:
1. Crear una cuenta nueva y llegar a /panel.
2. Entrar con una cuenta existente.
3. Recargar /panel con la sesión abierta.
4. Cerrar sesión y abrir /panel: debe redirigir a /login.

**Defectos:** ninguno.

**Veredicto:** Aprobado. La corrección está respaldada por la documentación local y cubre los dos caminos. La explicación de por qué el aviso solo salió con signUp sigue sin confirmar, y que el aviso haya desaparecido depende de la prueba manual del usuario.
