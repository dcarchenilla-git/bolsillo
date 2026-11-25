# T-002 · Ronda 1

## Entrega de Develop (literal)

T-002 · Ronda 1

La app ya tiene los clientes de Supabase para navegador y servidor y las variables de entorno preparadas. No hay pantallas nuevas. `npm run lint` y `npm run build` terminan sin errores con las variables vacías. No hice commit, push ni cambios de rama.

## Archivos cambiados
- C:\ia\claude\bolsillo\package.json (lo cambió npm install)
- C:\ia\claude\bolsillo\package-lock.json (lo cambió npm install)
- C:\ia\claude\bolsillo\src\lib\supabase\client.ts (nuevo)
- C:\ia\claude\bolsillo\src\lib\supabase\server.ts (nuevo)
- C:\ia\claude\bolsillo\.env.example (nuevo)
- C:\ia\claude\bolsillo\.env.local (nuevo; git lo ignora y no lo he leído)
- C:\ia\claude\bolsillo\.gitignore (solo se añadió `!.env.example`)

## Qué se hizo
1. Instalé los dos paquetes con `npm install @supabase/supabase-js @supabase/ssr`, sin fijar versión.
2. **client.ts** exporta `createClient()`, que llama a `createBrowserClient` con `process.env.NEXT_PUBLIC_SUPABASE_URL!` y `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!`. No lleva 'use client' porque es un módulo de utilidad y no un componente.
3. **server.ts** exporta `async function createClient()`:
   - Hace `const cookieStore = await cookies()` (de next/headers) y llama a `createServerClient` con `cookies: { getAll, setAll }`.
   - `setAll` está dentro de `try/catch {}`. El comentario dentro del catch explica que en Server Components no se pueden escribir cookies y que el futuro proxy refrescará la sesión.
   - Arriba lleva este comentario: "Lee cookies de la petición: quien lo use debe estar dentro de <Suspense> y nunca dentro de 'use cache' (cacheComponents)."
4. Ningún archivo importa todavía ninguno de los dos clientes. No hay otras variables ni claves.
5. **.env.example** contiene solo `NEXT_PUBLIC_SUPABASE_URL=` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=`.
6. **.env.local**: `test -e .env.local` dio NOT_EXISTS. Lo creé con esas dos líneas vacías mediante printf y no lo he vuelto a leer.
7. **.gitignore**: añadí `!.env.example` justo después de `.env*`. `git diff .gitignore` muestra solo `+!.env.example`.
8. Comprobación con `git check-ignore -v .env.local .env.example`:
   ```
   .gitignore:34:.env*	.env.local
   .gitignore:35:!.env.example	.env.example
   ```
   Es decir, .env.local queda ignorado y .env.example se puede subir al repo.

## Documentación usada
**Leída por mí en node_modules:**
- Next: `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`, secciones "Step 1: Read the current user" y "Step 2: Show the user without blocking the page". Dicen que con Cache Components leer `cookies()` fuera de `<Suspense>` es un error de build y que un 'use cache' normal no puede llamar a `cookies()`. De ahí viene el comentario de server.ts.
- Next: `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`:
  - "Loading Environment Variables": con /src, los .env se cargan desde la carpeta raíz y no desde src, así que van en la raíz.
  - "Bundling Environment Variables for the Browser": el prefijo `NEXT_PUBLIC_` mete el valor en el código del navegador al hacer el build.
- Los dos paquetes: `node_modules/@supabase/ssr/README.md` ("Installation", "Documentation", "Known patterns and limitations").
- Para client.ts: `node_modules/@supabase/ssr/dist/main/createBrowserClient.d.ts`, firma `createBrowserClient(supabaseUrl: string, supabaseKey: string, options?)`.
- Para server.ts:
  - `node_modules/@supabase/ssr/dist/main/createServerClient.d.ts`, firma no obsoleta `createServerClient(supabaseUrl: string, supabaseKey: string, options: { cookies: CookieMethodsServer, ... })`. Su comentario dice que los métodos get/set/remove están obsoletos y que se usen getAll/setAll. También dice que, si no se pueden escribir cookies desde páginas o componentes, el middleware tiene que refrescar la sesión.
  - `node_modules/@supabase/ssr/dist/main/types.d.ts`, tipos `CookieMethodsServer` (`getAll` obligatorio, `setAll` opcional), `GetAllCookies` y `SetAllCookies`.

**Pasada por ti, no leída por mí:** las tres URLs de supabase.com que me indicaste. No consulté la web en esta tarea; el patrón de getAll/setAll con try/catch lo confirmé con los tipos y comentarios de node_modules citados arriba.

## Salida literal de npm install
```
added 15 packages, and audited 374 packages in 4s

146 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
EXIT=0
```
(`EXIT=0` lo imprimió mi propio `echo` tras el comando.) No aparecieron avisos de tipo warn ni deprecated.

## Diff de package.json
```
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
diff --git a/package.json b/package.json
index c2a759a..1f6b43a 100644
--- a/package.json
+++ b/package.json
@@ -9,6 +9,8 @@
     "lint": "eslint"
   },
   "dependencies": {
+    "@supabase/ssr": "^0.12.7",
+    "@supabase/supabase-js": "^2.119.2",
     "next": "16.4.6",
     "react": "19.3.0",
     "react-dom": "19.3.0"
```
Versiones instaladas: @supabase/ssr 0.12.7 y @supabase/supabase-js 2.119.2.

Los paquetes que se añaden a package-lock.json son solo dependencias de esos dos: @supabase/auth-js, functions-js, phoenix, postgrest-js, realtime-js y storage-js (varios con su propio tslib dentro), además de cookie e iceberg-js.

## Resultado literal de lint y build
```
> bolsillo@0.1.0 lint
> eslint

LINT_EXIT=0

> bolsillo@0.1.0 build
> next build

▲ Next.js 16.4.6 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 27ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 652ms
  Running TypeScript ...
  Finished TypeScript in 1377ms ...
  Collecting page data using 5 workers ...
  Generating static pages using 5 workers (0/4) ...
  Generating static pages using 5 workers (1/4) 
  Generating static pages using 5 workers (2/4) 
  Generating static pages using 5 workers (3/4) 
✓ Generating static pages using 5 workers (4/4) in 457ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found


○  (Static)  prerendered as static content

BUILD_EXIT=0
```
(`LINT_EXIT` y `BUILD_EXIT` los imprimió mi propio `echo`.)

## Dudas
1. Uso `!` en las dos variables (`process.env.X!`), igual que el ejemplo de Supabase. Es una afirmación de tipo de TypeScript y no un `any`. No comprueba en tiempo de ejecución si faltan las variables; si las dejamos vacías, el fallo saldrá al llamar a `createClient()` y no en el build. Si se quiere una comprobación explícita, sería un cambio aparte.
2. No he usado `import 'server-only'` en server.ts porque `server-only` no está en package.json y la tarea prohíbe añadir otros paquetes. Si se quiere esa protección, haría falta autorización.
3. Git avisa de que convertirá LF a CRLF en package.json, package-lock.json y .gitignore la próxima vez que toque esos archivos. Es la configuración de git de este equipo; no cambié nada.

---

# Informe de Testing (literal)

T-002 · Ronda 1

**Revisado:** cambios sin commit en el working tree frente a HEAD 9c7699b. Son los cambios en `.gitignore`, `package.json` y `package-lock.json`, y los archivos nuevos `C:\ia\claude\bolsillo\src\lib\supabase\client.ts`, `C:\ia\claude\bolsillo\src\lib\supabase\server.ts` y `C:\ia\claude\bolsillo\.env.example`. `.env.local` existe; solo comprobé que existe y que git lo ignora, no lo abrí.

**Comprobaciones y resultado**
1. **Dependencias:** cumple. `git diff package.json` solo añade `"@supabase/ssr": "^0.12.7"` y `"@supabase/supabase-js": "^2.119.2"`. En node_modules las versiones coinciden: `npm ls --depth=0` da ssr@0.12.7 y supabase-js@2.119.2. Las demás entradas nuevas del lock son dependencias de esos dos paquetes: auth-js, functions-js, postgrest-js, realtime-js, storage-js, phoenix, cookie, iceberg-js y tslib. La salida literal de npm con los avisos no la revisé: está en la entrega que custodia el Orchestrator.
2. **client.ts:** cumple. Exporta `createClient()` con `createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)`.
3. **server.ts:** cumple. Exporta `async createClient()` con `createServerClient` y `await cookies()` de `next/headers`. Tiene `getAll`/`setAll`, y `setAll` va dentro de try/catch. No hay `any`; el tipo de `cookiesToSet` sale de @supabase/ssr.
4. **Claves:** cumple. Busqué en src/, .env.example, .gitignore y package.json `supabase|use cache|secret|service_role|sb_` y no aparece ninguna otra variable ni clave. `.env.example` solo tiene las dos variables sin valor.
5. **.env.example:** cumple. Tiene `NEXT_PUBLIC_SUPABASE_URL=` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=`.
6. **.env.local:** cumple. Existe, `git status` no lo lista, `git ls-files` no lo incluye y `git check-ignore -v` lo atribuye a la regla `.gitignore:34:.env*`. El build muestra "Environments: .env.local".
7. **.gitignore:** cumple. El diff solo añade `!.env.example` justo después de `.env*`, y `git check-ignore -v .env.example` confirma que esa regla de la línea 35 lo excluye.
8. **cacheComponents:** cumple. El cliente de servidor no se usa en ninguna página ni dentro de `'use cache'`; en src/ las únicas referencias a Supabase están en los dos archivos de src/lib. `server.ts` incluye el comentario sobre `<Suspense>` y sobre no usarlo nunca dentro de `'use cache'`.
9. **Lectura de guías:** no se puede verificar desde el código; el código coincide con el patrón de @supabase/ssr.
10. **Lint y build:** cumple. Los ejecuté yo. `npm run lint` termina con exit 0 y sin avisos. `npm run build` termina con exit 0 ("Cache Components enabled", "Compiled successfully", rutas `/` y `/_not-found` estáticas).
- **Fuera de alcance:** no hay cambios en AGENTS.md, next.config.ts ni public/. No hay proxy.ts ni middleware.ts. No hay commits nuevos.
- **Archivos sin seguimiento ajenos a lo previsto:**
  - `C:\ia\claude\bolsillo\.claude\launch.json` es una configuración para ejecutar `npm run dev` en el puerto 3000. Se creó a las 08:50:08, antes de cualquier archivo de Develop (08:59), y Develop no lo menciona en su entrega. No parece obra de Develop; el Orchestrator debería confirmar su origen antes de hacer commit.
  - `C:\ia\claude\bolsillo\docs\evidencias\T-002-ronda-1.md` es la evidencia del Orchestrator.

**Defectos:** ninguno.

**Veredicto:** Aprobado.
