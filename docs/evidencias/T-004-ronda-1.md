# T-004 · Ronda 1

## Entrega de Develop (literal)

T-004 · Ronda 1

He implementado crear, listar y borrar movimientos en /panel. `npm run lint` y `npm run build` terminan con código 0. No lo he probado contra Supabase porque no arranqué ningún servidor: que funcione de verdad, y que no salgan los avisos "Blocking Route" ni de Date.now(), lo tiene que comprobar el usuario con `npm run dev`. Un hook avisó de que había un servidor de vista previa en marcha; no lo usé, por la regla de la tarea.

## Archivos cambiados
- C:\ia\claude\bolsillo\src\lib\transactions.ts (nuevo)
- C:\ia\claude\bolsillo\src\app\panel\actions.ts (modificado; `git diff` solo muestra líneas añadidas, `signOut` sigue igual)
- C:\ia\claude\bolsillo\src\app\panel\page.tsx (modificado)
- C:\ia\claude\bolsillo\src\app\panel\transaction-form.tsx (nuevo, cliente)
- C:\ia\claude\bolsillo\src\app\panel\transaction-list.tsx (nuevo, servidor)
- C:\ia\claude\bolsillo\src\app\panel\delete-button.tsx (nuevo, cliente)

No he tocado nada más:
- next.config.ts, package.json, package-lock.json, AGENTS.md, layout.tsx, /login, el proxy, server.ts, la portada, public/ y el esquema de Supabase siguen igual.
- README.md y .claude/launch.json ya estaban modificados antes y no son míos.
- No he abierto .env.local.
- No hay commits, push ni cambios de rama.

## Qué se hizo

**1. src/lib/transactions.ts**
- No importa nada de servidor.
- Tipos: `TransactionType`, `Category`, `TransactionItem`, `CreateTransactionState` y `DeleteTransactionState`.
- Validaciones:
  - `isValidId`: entero de 1 a 18 cifras o uuid.
  - `parseAmount`: regex `^\d+([.,]\d{1,2})?$`, mayor que 0 y menor que 1e9. Cambia la coma por punto y devuelve el importe como texto, sin pasar por float.
  - `isValidDate`: formato AAAA-MM-DD; comprueba con `Date.UTC` que el día existe (2025-02-30 no vale) y que está entre 2000-01-01 y 2100-12-31.
  - `parseDescription`: aplica trim; si queda vacía devuelve null; si pasa de 200 caracteres es inválida.
- `todayInMadrid()` usa `Intl.DateTimeFormat` con `timeZone: "Europe/Madrid"` y `formatToParts`.
- `formatDate` pasa a dd/mm/aaaa partiendo el texto, sin `Date`.
- `formatAmount` usa `Intl.NumberFormat('es-ES', EUR)` con "+" o "−" (U+2212).
- `toCategories` y `toTransactionItems` convierten las filas desde `unknown`, sin `any`:
  - `amount` vale tanto como string como como number.
  - `categories(name)` vale como objeto o como array.

**2. actions.ts**
- `createTransaction(prevState, formData)`:
  - Comprueba los campos con `typeof === "string"`.
  - Llama a `getClaims()`; sin sesión responde "Tu sesión ha caducado. Vuelve a entrar." y no guarda.
  - Valida tipo, id de categoría, importe, fecha y descripción.
  - Consulta `categories.select("id, kind").eq("id", categoryId).maybeSingle()` y exige que `kind === type`.
  - Inserta solo `type`, `category_id` (el id devuelto por la BD), `amount`, `description` y `occurred_on`. Nunca envía `user_id`.
  - Si va bien, llama a `refresh()` de next/cache.
  - Si falla, devuelve "No se ha podido guardar el movimiento. Inténtalo de nuevo." Nunca `error.message`.
- `deleteTransaction(prevState, formData)`:
  - `getClaims()` y después `isValidId(id)`.
  - Ejecuta `.delete().eq("id", id).eq("user_id", claims.sub).select("id")`.
  - Si hay error o 0 filas, devuelve "No se ha podido borrar el movimiento."; si no, llama a `refresh()`.

**3. page.tsx**
- El saludo y el botón de cerrar sesión no cambian.
- Debajo hay dos secciones, cada una con su `<Suspense>`:
  - "Nuevo movimiento", con fallback "Cargando formulario…" y `TransactionFormLoader`. Este hace `await connection()`, `getClaims()` y lee `categories` (id, name, kind, ordenadas por id). Calcula `todayInMadrid()` en el servidor y se lo pasa al formulario como prop `today`.
  - "Tus movimientos", con fallback "Cargando movimientos…" y `TransactionList`.
- Contenedor `w-full max-w-xl text-left`.

**4. transaction-form.tsx (cliente)**
- Usa `useActionState`. El botón muestra "Guardando…" y está deshabilitado mientras `pending`.
- Cada respuesta del servidor trae un contador `seq`, y los campos se vuelven a montar con `key={state.seq}`:
  - si se guardó, vuelven a los valores por defecto (tipo Gasto, fecha `today`);
  - si hubo error, conservan lo que escribió el usuario. La acción devuelve solo esos textos, recortados.
- La categoría se filtra por el tipo elegido. El select de categoría lleva `key={type}`, así que se rehace al cambiar el tipo.
- El select de tipo no es controlado (`defaultValue` más `onChange`), para que no se desajuste cuando React reinicia el formulario tras el envío.
- Rejilla de una columna en móvil y dos desde `sm`.
- En el cliente no hay `new Date()`.

**5. transaction-list.tsx (servidor)**
- `await connection()`, `getClaims()` y la consulta: `select('id, type, amount, description, occurred_on, created_at, categories(name)')`, `.eq('user_id', claims.sub)`, `.order('occurred_on', desc)`, `.order('created_at', desc)`, `.limit(101)`.
- Muestra 100 filas. Si llegan más de 100, añade "Solo se muestran los últimos 100 movimientos.".
- Lista vacía: "Todavía no tienes movimientos.". Si la consulta falla: "No se han podido cargar los movimientos.".
- Cada fila muestra categoría, fecha, descripción si la hay, importe y botón Borrar.
- `min-w-0` y `break-words` en los textos; el importe con `whitespace-nowrap`.

**6. delete-button.tsx (cliente)**
- Usa `useActionState` con un input oculto `id`.
- Muestra "Borrando…" y está deshabilitado mientras `pending`. Si falla, enseña el mensaje debajo.

**Por qué no deberían salir avisos "Blocking Route" ni de Date.now()**
- Hay tres componentes que leen sesión o datos (Greeting, TransactionFormLoader y TransactionList). Los tres están dentro de su propio `<Suspense>` y empiezan con `await connection()`, antes de `createClient()`, `getClaims()` y `todayInMadrid()`.
- Según connection.md, "prerendering stops here / the following code only runs at request time". En el apartado "Good to know" añade que, con Cache Components, el componente debe ir dentro de `<Suspense>` y que el fallback va al static shell.
- Es el mismo patrón que corrigió el aviso en T-003 ronda 2.
- El cliente recibe `today` ya calculado, así que no hay hora en el render del cliente ni desajuste de hidratación.
- Una búsqueda en src/app/panel y src/lib/transactions.ts no encuentra 'use cache', `getSession` ni `error.message`. layout.tsx no se ha tocado.

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
✓ Compiled successfully in 654ms
  Running TypeScript ...
  Finished TypeScript in 1202ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6) 
  Generating static pages using 7 workers (2/6) 
  Generating static pages using 7 workers (4/6) 
✓ Generating static pages using 7 workers (6/6) in 509ms
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
"EXIT" es el `echo $?` que añadí al comando. Que /login salga como ◐ ya venía de T-003 ronda 3, que está en HEAD.

## Documentación usada

**Leída por mí** (en node_modules/next/dist/docs/01-app/):
- 01-getting-started/07-mutating-data.md:
  - "Showing a pending state": `useActionState` y `pending`.
  - "Refresh data": `refresh()` de next/cache dentro de una Server Action, con la sesión comprobada antes.
  - "Revalidate data": `revalidatePath`/`revalidateTag`. No hacen falta, porque no hay 'use cache'.
- 03-api-reference/04-functions/refresh.md: solo funciona dentro de Server Actions y su firma es `refresh(): void`.
- 02-guides/forms.md:
  - "Form validation": validación en el servidor y salir pronto si los datos no valen.
  - "Validation errors": firma `(prevState, formData)` y mostrar `state.message`.
  - "Pending states": `disabled={pending}`.
- 02-guides/data-security.md:
  - "Validating client input": no fiarse de lo que manda el cliente.
  - "Authentication and authorization": comprobar la sesión en cada acción; IDOR y comprobar que el recurso es del usuario, que aquí hacen RLS más `.eq('user_id')`.
  - "Controlling return values": devolver solo lo que necesita la interfaz.
- 02-guides/authentication-with-cache-components.md:
  - "Step 1": validar la sesión depende de la hora.
  - "Step 2": la sesión va detrás de `<Suspense>`.
  - "Common pitfalls": comprobar la sesión en cada Server Action.
- 03-api-reference/04-functions/connection.md: Usage y "Good to know".
- Tipos de @supabase/postgrest-js 2.119.2 (node_modules/@supabase/postgrest-js/dist/index.d.mts):
  - `select` (~1196 y ~4356), `order` con `{ ascending }` (~1216), `limit` (~1342), `insert` (~4480) y `delete` (~5011).
  - `insert` y `delete` devuelven `null` como resultado si no se encadena `.select()`.
- Comprobé que `refresh` se exporta en node_modules/next/cache.d.ts.

**Pasada por el Orchestrator** (Supabase):
- row-level-security: lo filtrado por RLS da 0 filas, no un error.
- insert y delete: `.select()` para que devuelvan las filas.
- select: tablas relacionadas.
- using-modifiers-order.

## Dudas
1. **Esquema sin confirmar:** no he podido ver el esquema real. He supuesto que las columnas de `categories` son `id, name, kind` y que los ids son enteros o uuid (`isValidId` acepta los dos). Si el id fuera de otro tipo, las validaciones lo rechazarían.
2. **Embebido `categories(name)`:** con una FK compuesta `(category_id, type)`, supongo que PostgREST detecta la relación. Si hubiera más de una FK entre las dos tablas daría error de ambigüedad, y la lista mostraría "No se han podido cargar los movimientos.".
3. **Orden de las categorías:** las ordeno por `id`. No sé si se prefiere por nombre.
4. **Algo que no pedía la tarea:** si hay un error, el formulario conserva lo escrito (la acción devuelve los textos del usuario, recortados). Lo añadí porque React 19 reinicia el formulario después de cada acción y, sin esto, el usuario perdería lo que escribió. Si no se quiere, se quita.
5. **Validación en el navegador:** el input de importe lleva `pattern`, `required` y `inputMode="decimal"`, y la fecha lleva `min`/`max`. Esto se añade a la validación del servidor, no la sustituye.
6. **Tipos de Supabase:** no hay tipos generados del esquema, así que `category.kind` y `category.id` quedan con tipos sueltos que vienen de supabase-js. No hay ningún `any` escrito en el código. Las filas que se pintan pasan por `toTransactionItems`/`toCategories`, que parten de `unknown`.
7. **Pendiente de prueba manual del usuario** (`npm run dev`), porque yo no lo he comprobado:
   - crear un ingreso y un gasto;
   - meter un importe con coma;
   - una fecha inválida;
   - borrar un movimiento;
   - la lista vacía;
   - verlo a 375 px;
   - que no salga ningún aviso "Blocking Route" ni de Date.now().

---

# Informe de Testing (literal)

T-004 · Ronda 1

**Veredicto: Aprobado.** No he encontrado defectos. Lint y build pasan cuando los ejecuto yo. No he probado contra Supabase ni con `npm run dev`; eso queda para el usuario (lista al final).

**Revisado:** cambios sin commit sobre HEAD e6827ca.
- Modificados: `src/app/panel/actions.ts` y `src/app/panel/page.tsx`.
- Nuevos: `src/lib/transactions.ts`, `src/app/panel/transaction-form.tsx`, `src/app/panel/transaction-list.tsx` y `src/app/panel/delete-button.tsx`.
- También leí la entrega, `docs/evidencias/T-004-ronda-1.md`.
- No revisé README.md ni .claude/launch.json porque no son de Develop. No abrí .env.local.

## Comprobaciones y resultado

**Criterio 10: lint y build (los ejecuté yo).**
- `npm run lint` terminó con código 0.
- `npm run build` terminó con código 0: Next 16.4.6, Cache Components activado, TypeScript sin errores.
- En el build, /panel sale como ◐ (Partial Prerender) y no hay avisos.

**Criterio 8: archivos que no se debían tocar.** `git diff --stat HEAD` solo muestra README.md, actions.ts y page.tsx. Siguen igual:
- layout.tsx, /login, el proxy, la portada, next.config.ts, package.json, package-lock.json y AGENTS.md.

En page.tsx el diff solo añade líneas: Greeting y el botón de cerrar sesión no cambian. En actions.ts, `signOut` tampoco cambia.

**Criterio 1: formulario. OK.**
- Está bajo el saludo, en su propio `<Suspense>` con el texto de carga "Cargando formulario…".
- `TransactionFormLoader` hace, por este orden: `await connection()`, `getClaims()`, la lectura de `categories` en servidor y `todayInMadrid()` (Intl con Europe/Madrid). La fecha llega al formulario como prop `today`.
- En el componente de cliente no hay `new Date()`. Los dos `new Date` que existen están en transactions.ts: uno en `isValidDate` (sobre `Date.UTC`, sin hora actual) y otro en `todayInMadrid`, que solo se llama en servidor.
- La categoría se filtra por tipo.

**Criterio 2: createTransaction. OK.**
- Todos los campos se leen con `typeof === "string"` y se llama a `getClaims()`.
- Lo único que se lee del FormData es type, category_id, amount, description y occurred_on. Si alguien manda un `user_id`, se ignora.
- El insert solo lleva type, `category_id` (el id que devuelve la BD), amount, description y occurred_on. **No envía user_id.**
- La categoría se consulta en BD con `.maybeSingle()` y se exige `kind === type`.
- Si va bien, llama a `refresh()`. Si falla, el mensaje es genérico y en español; no se usa `error.message` en ningún sitio.

**Importe (revisado a mano sobre el regex `^\d+([.,]\d{1,2})?$`, con `trim` y `0 < n < 1e9`):**

| Entrada | Resultado |
|---|---|
| "0.00" | rechazado (es 0) |
| "0,001" | rechazado (regex) |
| "1e5" | rechazado (regex) |
| "-5" | rechazado (regex) |
| " 5" | aceptado como "5" tras trim (me parece correcto) |
| "999999999,99" | aceptado y normalizado a "999999999.99"; cabe en numeric(12,2) |
| "1000000000" | rechazado (≥1e9) |

- A la BD se envía el texto normalizado, no un float. `Number()` solo se usa para comparar.
- Cerca de 1e9, con como mucho 2 decimales, el redondeo de un double no puede convertir un valor ≥1e9 en uno menor.
- `\d` sin el flag u solo admite dígitos ASCII.

**Fechas (`isValidDate`).**
- 2025-02-30 se rechaza (el día pasa al mes siguiente y no coincide).
- 2023-02-29 se rechaza.
- 2024-02-29 se acepta.
- Comprueba el rango 2000-01-01 a 2100-12-31 comparando textos (válido con el formato fijo AAAA-MM-DD).

**Descripción.** Aplica trim, la vacía pasa a null y más de 200 caracteres se rechaza.

**Criterio 3: lista. OK.**
- La consulta va en servidor, con `.eq("user_id", claims.sub)`, orden por occurred_on desc y luego created_at desc, y `limit(101)`.
- Muestra 100 filas. El aviso exacto "Solo se muestran los últimos 100 movimientos." sale si llegan más de 100.
- Fecha en dd/mm/aaaa sin usar Date, categoría embebida, descripción si la hay e importe en EUR es-ES con "+" o "−" (U+2212), y botón Borrar.

**Criterio 4: deleteTransaction. OK.**
- Llama a `getClaims()` y valida el id con `isValidId` (entero de 1 a 18 cifras o uuid).
- Ejecuta `.delete().eq("id", id).eq("user_id", claims.sub).select("id")`.
- Si hay error o vuelven 0 filas, responde "No se ha podido borrar el movimiento."; si no, llama a `refresh()`.
- Manipular el id no permite borrar filas de otro usuario. Hay tres barreras: RLS, el filtro por user_id con el `sub` de la sesión (nunca del cliente) y la comprobación de que se borró alguna fila.

**Criterio 5: estados. OK.**
- Hay textos de carga en las dos secciones nuevas.
- "Guardando…" y "Borrando…" salen con el botón deshabilitado mientras dura la acción (`pending`).
- Lista vacía: "Todavía no tienes movimientos."

**Criterio 6: seguridad. OK.**
- Todas las consultas van en servidor con `@/lib/supabase/server` (clave publishable, así que aplica RLS).
- Nada se filtra solo en el cliente y no hay secret key.

**Valores que devuelven las Server Actions (data-security.md, "Controlling return values").**
- Solo devuelven status, un mensaje, el contador `seq` y, si hubo error, lo que escribió el propio usuario (recortado).
- Nunca devuelven filas de la BD, ids internos ajenos ni errores de Supabase. OK.

**Criterio 7: cacheComponents. OK.**
- Greeting, TransactionFormLoader y TransactionList están cada uno en su `<Suspense>` y empiezan con `await connection()`.
- En src/ no hay `'use cache'` como directiva (solo aparece en un comentario de server.ts) ni `getSession`.

**Formulario con seq/key: no rompe nada evidente.**
- Tras guardar, se remonta con tipo Gasto y la fecha de hoy.
- Tras un error, conserva lo escrito. Si el tipo devuelto no es válido, vuelve a "gasto".
- Si la categoría guardada no corresponde al tipo, se usa la primera del tipo (`options.some(...)`), y `key={type}` remonta el select al cambiar de tipo. La categoría nunca queda desajustada con el tipo y, aun así, el servidor lo vuelve a comprobar.

**`any`.** No hay ninguno en src/ (lo busqué con grep). Las filas se convierten partiendo de `unknown`.

**Criterio 4 de las directrices.** Solo llevan 'use client' transaction-form.tsx y delete-button.tsx, y los dos lo necesitan (`useActionState`/`useState`).

**Criterio 9: 375 px (revisado solo en el código).** Si se acepta lo de guardar lo escrito, el diseño está bien para 375 px:
- El formulario tiene una columna en móvil y dos desde `sm`, con inputs a lo ancho.
- La lista usa `min-w-0`/`break-words` y el importe `whitespace-nowrap`.
- Con `px-6` en main y `px-4` en cada fila quedan unos 295 px útiles; el importe más largo ocupa unos 150 px.

**Criterio 11: documentación.** Develop cita la documentación local con apartados concretos: mutating-data, refresh, forms, data-security, authentication-with-cache-components y connection.

## Defectos
Ninguno.

**Para que decidas tú (no son defectos):**
- Develop añadió por su cuenta que el formulario conserve lo escrito si hay un error (su Duda 4). Es una mejora de cómo funciona el formulario, no una función fuera de alcance, y no devuelve datos sensibles.
- Develop no conoce el esquema real (Dudas 1 y 2): el tipo de `categories.id` y si el embebido `categories(name)` funciona con la FK compuesta. Solo se puede confirmar contra la BD.

## Lo que queda para la prueba manual del usuario (`npm run dev`)
1. Que no salga ningún aviso "Blocking Route" ni de Date.now() en la terminal ni en el navegador al abrir /panel.
2. Crear un ingreso y un gasto, uno de ellos con importe con coma (12,50), y ver que salen con +/−, en euros y en orden.
3. Crear con descripción vacía y con descripción.
4. Probar un importe y una fecha inválidos: tiene que salir un mensaje en español.
5. Borrar un movimiento: tiene que desaparecer.
6. Ver la lista vacía con una cuenta sin movimientos.
7. Comprobar que la lista carga, es decir, que el embebido `categories(name)` funciona con el esquema real. Si falla, saldrá "No se han podido cargar los movimientos.".
8. Prueba con dos cuentas: la cuenta B no ve los movimientos de A y no puede borrarlos.
9. Verlo a ~375 px y en escritorio.
