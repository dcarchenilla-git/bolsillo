# T-006 · Ronda 3

## Motivo de la ronda (decidido por el usuario)

Tras leer el README aprobado en la ronda 2, el usuario pidió cuatro cambios solo en README.md: (1) en la sección 6, indicar que no se confirmó por qué el aviso de Date.now() salió solo al crear cuenta y no al entrar; (2) añadir a la tabla la fila de T-006 con 3 rondas (ronda 1 rechazada por un defecto de formato, ronda 2 aprobada, ronda 3 descrita solo como "ajustes de contenido pedidos por el usuario tras leer el README", sin veredicto), con enlaces a sus evidencias y "este commit" en lugar de un hash; (3) una frase en la sección 5 sobre los rechazos de Testing; (4) indicar la fuente del requisito de Node 20.9 (campo engines de node_modules/next/package.json, visible tras npm install), y que Testing decida si es comprobable; si no lo es, quitar la cifra.

## Entrega de Develop (literal)

T-006 · Ronda 3

## Archivos cambiados
- C:\ia\claude\bolsillo\README.md (es el único; `git status` muestra solo ese archivo como modificado, y los archivos sin seguimiento son los mismos que había antes).

## Qué se hizo

**1. Sección 6, apartado del aviso de `Date.now()`**
- Antes: no había ninguna línea sobre lo que no se confirmó. Entre "Solución" y "Lección" no había nada.
- Después (nueva viñeta antes de "Lección"):
  ```
  - **Qué no se confirmó:** por qué el aviso salió solo al crear una cuenta y no al entrar con una cuenta existente.
    Develop lo atribuyó, sin comprobarlo, a que era la primera visita a `/panel` con sesión, y Testing lo dejó en "Qué no está confirmado"
    ([docs/evidencias/T-003-ronda-2.md](docs/evidencias/T-003-ronda-2.md)).
  ```
- Fuentes, todas en T-003-ronda-2.md:
  - Línea 5: la precisión del usuario ("al pulsar en crear cuenta, no al pulsar en entrar").
  - Línea 146: la entrega de Develop ("probablemente porque era su primera visita a `/panel` con sesión").
  - Línea 214: el informe de Testing ("Qué no está confirmado: por qué el aviso solo salió tras signUp").
  - Línea 225: el veredicto ("sigue sin confirmar").

**2. Sección 5, fila de T-006 en la tabla**
- Antes: la tabla terminaba en la fila de T-005.
- Después (fila añadida):
  ```
  | T-006 | Reescribir README.md | 3 | Ronda 1: Rechazado (defecto de formato) · Ronda 2: Aprobado · Ronda 3: ajustes de contenido pedidos por el usuario tras leer el README | este commit | [ronda 1](docs/evidencias/T-006-ronda-1.md) · [ronda 2](docs/evidencias/T-006-ronda-2.md) · [ronda 3](docs/evidencias/T-006-ronda-3.md) |
  ```
- Fuentes:
  - T-006-ronda-1.md, línea 181: "Rechazado. Hay un defecto de formato".
  - T-006-ronda-2.md, línea 117: "Aprobado".
  - La ronda 3 va sin veredicto, como pediste.
- No hay ningún hash inventado. El enlace a T-006-ronda-3.md todavía no funciona porque ese archivo aún no existe.

**3. Sección 5, frase sobre los rechazos** (justo debajo de la tabla, antes de "Por qué T-003 tuvo 3 rondas")
- Antes: no existía.
- Después:
  ```
  En T-001 a T-005 Testing no rechazó ninguna ronda. El defecto de `Date.now()` lo encontró el usuario al probar la app,
  y el único rechazo de Testing fue el de la ronda 1 de T-006, por un defecto de formato.
  ```
- Fuente: con grep de "Veredicto" en todas las evidencias:
  - T-001-r1 (línea 85), T-002-r1 (153), T-003-r1 (181), T-003-r2 (225), T-003-r3 (228), T-004-r1 (187) y T-005-r1 (261): todos Aprobado.
  - T-006-r1 (179-181): Rechazado.
  - T-006-r2 (116-117): Aprobado.
  - Que lo encontró el usuario: T-003-ronda-2.md, línea 5.

**4. Sección 8, requisito de Node 20.9**
- Antes: `Requisitos: Node.js 20.9 o superior (lo exige Next.js 16.4.6) y npm.`
- Después: `Requisitos: Node.js 20.9 o superior (lo exige Next.js 16.4.6: campo `engines` de `node_modules/next/package.json`, visible tras `npm install`) y npm.`
- Fuente: node_modules/next/package.json, líneas 137-139: `"engines": { "node": ">=20.9.0" }`. La cifra coincide, así que se mantiene.

## Resultado literal de lint y build
```
> bolsillo@0.1.0 lint
> eslint

EXIT lint: 0

> bolsillo@0.1.0 build
> next build

▲ Next.js 16.4.6 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 21ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 425ms
  Running TypeScript ...
  Finished TypeScript in 1015ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6) 
  Generating static pages using 7 workers (2/6) 
  Generating static pages using 7 workers (4/6) 
✓ Generating static pages using 7 workers (6/6) in 508ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ◐ /login
└ ◐ /panel


ƒ Proxy (Middleware)

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content

EXIT build: 0
```

## Dudas
1. La columna se llama "Título (de `git log`)", pero T-006 todavía no tiene commit, así que "Reescribir README.md" sale de la asignación y no de `git log`. No he cambiado la cabecera porque no estaba en los cuatro cambios pedidos.
2. La celda de veredicto de T-006 es más larga que las demás porque describe las tres rondas. Mantuve el formato del resto con separadores " · ", igual que en la columna de evidencias.
3. Un dato que no es de esta tarea: el build marca `/login` como ◐ (Partial Prerender). T-003-ronda-2.md (línea 204) lo registraba como ○. No he cambiado nada por eso; solo lo menciono.

---

# Informe de Testing (literal)

T-006 · Ronda 3

**Revisado:** archivos sin commit sobre HEAD 1d659ed. Solo ha cambiado C:\ia\claude\bolsillo\README.md, y lo leí entero (186 líneas). No abrí .env.local.

**Comprobaciones y resultado**

1. **Sección 6, viñeta "Qué no se confirmó" (README:108-110): correcta.** Coincide con C:\ia\claude\bolsillo\docs\evidencias\T-003-ronda-2.md:
   - Línea 5: la precisión del usuario ("al pulsar en crear cuenta, no al pulsar en entrar").
   - Línea 146: la hipótesis de Develop. Empieza por "probablemente", así que la expresión "sin comprobarlo" es fiel.
   - Línea 214: lo que Testing dejó en "Qué no está confirmado".
   - Línea 225: el veredicto ("sigue sin confirmar").
   - No añade nada nuevo. No recoge las posibles explicaciones de Testing de la línea 212; omitirlas no es un defecto.

2. **Sección 5, fila de T-006 (README:86): correcta.**
   - Rondas: 3.
   - Ronda 1: Rechazado (defecto de formato). Coincide con T-006-ronda-1.md:181.
   - Ronda 2: Aprobado. Coincide con T-006-ronda-2.md:117.
   - Ronda 3: tiene el texto pedido y ningún veredicto.
   - Commit: "este commit", sin hash inventado.
   - Los enlaces a las tres evidencias de T-006 existen (comprobado con `test -e`).

3. **Sección 5, frase sobre los rechazos (README:88-89): correcta.** Busqué con grep "Veredicto", "Aprobad" y "Rechazad" en todas las evidencias:
   - De T-001 a T-005 todas las rondas son Aprobado: T-001-r1:85, T-002-r1:153, T-003-r1:181, T-003-r2:225, T-003-r3:228, T-004-r1:187 y T-005-r1:261.
   - El defecto de Date.now() lo encontró el usuario: T-003-ronda-2.md:3-5 ("reportado por el usuario, prueba manual").
   - El único Rechazado es el de T-006-ronda-1.md:181, por formato.

4. **Sección 8, Node 20.9 (README:148): la fuente es comprobable en el repositorio.**
   - C:\ia\claude\bolsillo\node_modules\next\package.json:137-139 dice `"engines": { "node": ">=20.9.0" }`.
   - node_modules no está en git, pero C:\ia\claude\bolsillo\package-lock.json sí lo está (`git ls-files` lo confirma).
   - En el lockfile, la entrada `"node_modules/next"` (línea 5360) tiene versión 16.4.6 y `"engines": { "node": ">=20.9.0" }` (líneas 5376-5378).
   - Por tanto la cifra se puede comprobar en el repositorio sin instalar nada, y queda dentro del criterio. La fuente citada en el README es válida, aunque es menos directa que el lockfile.
   - **Mejora opcional, no es defecto:** citar package-lock.json como fuente versionada.

5. **No ha cambiado nada más del README respecto a la ronda 2.**
   - `git diff --stat` da 173 líneas añadidas y 23 quitadas (en la ronda 2 eran 166 y 23).
   - Las 7 líneas de diferencia salen exactas: 3 de la viñeta, 1 de la fila y 3 de la frase (2 líneas más 1 en blanco). La línea 148 solo cambia por dentro.
   - Al releer, el resto coincide con lo aprobado.
   - Las secciones 1 a 10 están presentes y en orden.
   - Todos los enlaces relativos existen.
   - No aparecen "launch", "sb_", "eyJ", "service_role" ni correos. "contraseña" sale solo de forma genérica (líneas 31, 83 y 186), sin ninguna contraseña real. "secret" sale solo para decir que no se usa (líneas 140 y 158).

6. **Develop solo cambió README.md.** `git status` muestra modificado únicamente README.md. Los archivos sin seguimiento (.claude/launch.json, docs/evidencias/T-006-ronda-1..3.md, docs/evidencias/incidente-vercel.md, docs/supabase-schema.sql) son los del Orchestrator, ajenos a Develop.

7. **lint y build pasan.** Los ejecuté yo:
   - `npm run lint`: código de salida 0.
   - `npm run build`: código de salida 0, con Next.js 16.4.6 y "Compiled successfully". Rutas: / ○, /_not-found ○, /login ◐, /panel ◐.

**Dudas de Develop**

- **Duda 1** (la cabecera "Título (de `git log`)" con T-006 todavía sin commit): no es defecto, es una observación. Cuando se haga el commit de T-006, el título debería coincidir con "Reescribir README.md" para que la cabecera siga siendo cierta. Basta con que el Orchestrator use ese título en el mensaje del commit.
- **Duda 3** (/login sale como ◐ y T-003-ronda-2.md lo registraba como ○): no es defecto, es una observación. Mi build confirma ◐ en la situación actual. El README no menciona ○ ni ◐ en ningún sitio, así que no afirma nada falso. Que el dato de T-003 ya no coincida no afecta a esta tarea.

**Otra observación (no es defecto de Develop):** el README enlaza archivos que todavía no están en git: docs/supabase-schema.sql, docs/evidencias/incidente-vercel.md y las tres evidencias de T-006. Hay que incluirlos en el mismo commit que el README para que los enlaces funcionen en el repositorio. Es tarea del Orchestrator.

**Defectos:** ninguno.

**Veredicto:** Aprobado.
