# T-005 · Ronda 1

## Entrega de Develop (literal)

T-005 · Ronda 1

Las tres tarjetas (Ingresos, Gastos y Saldo) ya están en /panel, entre el saludo y "Nuevo movimiento". `npm run lint` y `npm run build` terminan con código 0. No lo he probado contra Supabase porque no arranqué ningún servidor. Un hook avisó de que había un servidor de vista previa en marcha; no lo usé, por la regla de la tarea. Que las cifras salgan bien con datos reales y que se actualicen tras crear o borrar lo tiene que comprobar el usuario con `npm run dev`.

## Archivos cambiados
- C:\ia\claude\bolsillo\src\app\panel\summary-cards.tsx (nuevo, servidor)
- C:\ia\claude\bolsillo\src\app\panel\page.tsx (modificado: un import y una sección nueva con su `<Suspense>`)
- C:\ia\claude\bolsillo\src\lib\transactions.ts (modificado: solo se añade código, no se cambia nada de lo que había)

No he tocado nada más:
- actions.ts, transaction-form.tsx, transaction-list.tsx, delete-button.tsx, layout.tsx, /login, el proxy, la portada, next.config.ts, package.json, package-lock.json, AGENTS.md y el esquema de Supabase siguen igual.
- README.md y .claude/launch.json ya estaban modificados antes y no son míos.
- No he abierto .env.local.
- No hay commits, push ni cambios de rama.
- `grep "use cache|getSession" src/` no devuelve nada.

## Qué se hizo

**1. src/lib/transactions.ts**
- `amountToCents(value: unknown): number | null`
  - Solo acepta number o string.
  - Pasa el valor a texto con `String(value)` y lo comprueba con `/^(\d+)(?:\.(\d{1,2}))?$/`.
  - Calcula `Number(entero) * 100 + Number(decimales.padEnd(2, "0"))`, sin multiplicar floats.
  - Devuelve null si el resultado no es `Number.isSafeInteger`.
- `type Totals = { incomeCents; expenseCents }`.
- `addToTotals(totals, rows)` suma un bloque en enteros.
  - Devuelve null si una fila no tiene un type válido o un amount válido.
  - También devuelve null si algún acumulado deja de ser safe integer.
- `formatCents(cents)` es `euros.format(cents / 100)` y reutiliza el `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })` que ya existía. Solo divide al formatear.

**2. summary-cards.tsx**
- `SummaryCards` hace, en este orden: `await connection()`, `createClient()` y `getClaims()`. Sin claims devuelve null, como TransactionList.
- `loadTotals` lee por bloques. Cada bloque es una petición:
  `select("type, amount", { count: "exact" }).eq("user_id", claims.sub).order("id", { ascending: true }).range(from, from + PAGE_SIZE - 1)`
- Constantes `PAGE_SIZE = 1000` y `MAX_PAGES = 200`. La justificación del tope está en un comentario (cifras del Orchestrator).
- Pido count en todas las peticiones. Así el tipo es el mismo en cada vuelta, y si count cambia entre bloques el código lo detecta y no da cifras.
- Después de cada bloque, `from` y `received` avanzan en `data.length`, las filas realmente recibidas. No se supone ningún tamaño de bloque.
- Se para cuando `received >= count` o cuando llega un bloque vacío.
- Al terminar, si `received !== count` devuelve null. Eso cubre tres casos: tope alcanzado sin completar, bloque vacío antes de tiempo y más filas de las contadas.
- También devuelve null si hay un error de Supabase, si count es null, si data no es un array o si algún importe no es válido.
- Si es null, la pantalla muestra "No se han podido calcular los totales." y ninguna cifra.
- Saldo = ingresos − gastos, en céntimos.
- Colores:
  - Saldo: `text-green-700 dark:text-green-400` si > 0, `text-red-700 dark:text-red-400` si < 0 y `text-zinc-900 dark:text-zinc-100` si es exactamente 0.
  - Ingresos siempre en verde y Gastos siempre en rojo, como en la lista.

**3. Diseño de las tarjetas**
- Es un `<dl>` con `grid grid-cols-1 gap-3 sm:grid-cols-3`.
- Cada tarjeta: `min-w-0 rounded-lg border border-zinc-200 bg-white px-4 py-3`, con sus variantes `dark:` en zinc-800/900 como la lista.
- Título: `text-sm text-zinc-500`.
- Importe: `text-2xl` en móvil y `sm:text-lg` en tres columnas, con `font-semibold tabular-nums wrap-anywhere`. `wrap-anywhere` es `overflow-wrap:anywhere`; lo he comprobado en Tailwind 4.3.3.

Por qué este diseño (sin comprobación visual):
- A 375 px hay una sola columna de unos 327 px útiles. "999.999.999,99 €" a text-2xl ocupa unos 220 px según mi estimación, así que cabe.
- Desde sm, el contenedor sigue limitado por `max-w-xl` (576 px), así que pasar a md no daría más ancho. Cada tarjeta deja unos 150 px útiles, y por eso el importe baja a text-lg.
- Con `min-w-0` y `wrap-anywhere`, un importe extremo (sobre todo un saldo negativo de 9 cifras) que no quepa se parte en otra línea dentro de la tarjeta en vez de desbordar. Un corte de línea en mitad de un número muy grande me parece más aceptable que un desborde.
- Intl pone un espacio no separable antes de "€", así que el símbolo no se separa solo.
- Hay que comprobarlo a 375 px y a unos 640 px.

**4. page.tsx**
- Nueva sección encima de "Nuevo movimiento", con un h2 "Resumen" (ver Dudas).
- Su `<Suspense>` tiene el fallback "Calculando totales…" y dentro va `<SummaryCards />`.
- El resto no cambia.

**5. Actualización**
Las tarjetas se recalculan tras crear o borrar gracias al `refresh()` que ya hay en actions.ts, sin tocarlo. Son un componente dinámico dentro del árbol de /panel y no usan ninguna caché.

## Tabla de casos (A)
Resuelta a mano leyendo el código, sin ejecutarlo.

| Entrada | Céntimos | Resultado formateado | Color del saldo |
|---|---|---|---|
| ingreso "0.10" + ingreso "0.20" | 0·100+10 = 10; 0·100+20 = 20; suma 30 exacta | Ingresos "0,30 €", Gastos "0,00 €", Saldo "0,30 €" | verde (30 > 0) |
| 12.5 (number) | String → "12.5"; decimales "5" → "50"; 1200+50 = 1250 | "12,50 €" | — |
| "12.50" (string) | 1200+50 = 1250 | "12,50 €" | — |
| "999999999.99" | 99999999900+99 = 99999999999 (safe integer) | "999.999.999,99 €" | — |
| ingreso "100.00", gasto "150.25" | 10000 y 15025; saldo 10000−15025 = −5025 | Ingresos "100,00 €", Gastos "150,25 €", Saldo "-50,25 €" | rojo |
| Sin movimientos | count = 0 y bloque vacío: se para en la primera vuelta; totales 0/0, saldo 0 | "0,00 €" en las tres | zinc (neutro) |
| "1e5" | no encaja con el regex (lleva "e") → null | "No se han podido calcular los totales." | — |
| "-3" | no encaja (signo) → null | mensaje de error | — |
| "1.234" | no encaja (3 decimales) → null | mensaje de error | — |
| NaN, 1e21 (number) | String da "NaN" y "1e+21": no encajan → null | mensaje de error | — |
| null, "", " 12" | null no es number ni string; "" y " 12" no encajan → null | mensaje de error | — |

Notas:
- Para 0,1 + 0,2, los floats darían 0,30000000000000004. Aquí se suman enteros (10 + 20) y solo se divide al formatear.
- Intl es-ES no agrupa los miles con 4 cifras: 1234 € sale "1234,00 €". Desde 5 cifras sí: "12.345,00 €". Es el comportamiento normal de es-ES.

## Limitación conocida (B)
Las peticiones por bloques no forman una transacción: cada una ve el estado de la BD en su momento.

Si el usuario crea o borra un movimiento (por ejemplo, desde otra pestaña) mientras se leen los bloques:
- Al borrar una fila con id menor que `from`, las filas siguientes se desplazan una posición hacia atrás en el orden por id, y range se salta una fila.
- Al crear una, el id nuevo es mayor y aparece en el último bloque.

Qué hace el código:
- Pide count en cada bloque. Si count cambia entre bloques, devuelve null y se muestra "No se han podido calcular los totales.".
- Si count no cambia pero las filas recibidas no suman count (bloque vacío antes de tiempo, filas de más o tope alcanzado), también muestra el mensaje.

Caso que no se detecta: un borrado y una creación entre dos bloques, que dejan count igual. Podría saltarse una fila o contar la nueva, y la cifra mostrada sería una mezcla de los dos estados.

Por qué se acepta para esta app:
- Solo ocurre con más de 1000 movimientos, porque hasta entonces todo llega en una sola petición y es coherente.
- Además, el cambio tiene que caer justo entre dos peticiones de milisegundos.
- Es una app personal con un solo usuario por cuenta.
- La siguiente carga (el `refresh()` tras crear o borrar, o recargar) lo corrige.
- Evitarlo del todo exigiría agregados o funciones en la BD, que están fuera de alcance.

## Resultado literal de lint y build
```
> bolsillo@0.1.0 lint
> eslint

EXIT lint 0

> bolsillo@0.1.0 build
> next build

▲ Next.js 16.4.6 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 23ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 468ms
  Running TypeScript ...
  Finished TypeScript in 1193ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6) 
  Generating static pages using 7 workers (2/6) 
  Generating static pages using 7 workers (4/6) 
✓ Generating static pages using 7 workers (6/6) in 499ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ◐ /login
└ ◐ /panel


ƒ Proxy (Middleware)

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content

EXIT build 0
```

## Documentación usada

**Leída por mí** (en node_modules/next/dist/docs/01-app/ y node_modules/@supabase/postgrest-js):
- 01-getting-started/07-mutating-data.md, "### Refresh data": `refresh` de next/cache se llama en una Server Action para "refresh the current page to show the latest data". Por eso no hace falta tocar actions.ts.
- 03-api-reference/04-functions/refresh.md, "Usage": "`refresh` can **only** be called from within Server Actions".
- 03-api-reference/04-functions/connection.md (intro): "indicate rendering should wait for an incoming user request before continuing"; sirve para lo que depende de cada petición, como `new Date()`. Lo aplico antes de `getClaims` (que mira la caducidad del token).
- 02-guides/authentication-with-cache-components.md:
  - Step 1: ni `use cache` ni `use cache: remote` pueden llamar a `cookies()`.
  - Step 2: "A component that reads the session must sit behind a `<Suspense>` boundary"; "Keep the session read out of a layout's top level".
  - Por eso SummaryCards va en su propio `<Suspense>` y no lleva `'use cache'`.
- 02-guides/data-security.md, "### Controlling return values": "Only return what the UI needs, not raw database records". El componente solo pide type y amount, y al HTML solo llegan tres cifras formateadas.
- @supabase/postgrest-js 2.119.2, dist/index.d.mts:
  - `range(from: number, to: number, { referencedTable? })`: "0-based and inclusive" y "if there is no order clause the range could behave unexpectedly".
  - `order(column, { ascending?, nullsFirst?, referencedTable? })`.
  - `select(columns?, { head?: boolean; count?: 'exact' | 'planned' | 'estimated' })`.
  - Comentario de select: "When using `count` with `.range()` or `.limit()`, the returned `count` is the total number of rows that match your filters, not the number of rows in the current page".
  - `PostgrestResponseSuccess`: `count: number | null`; `PostgrestResponseFailure`: `data: null; count: null`.
  - El mismo archivo dice "By default, Supabase projects return a maximum of 1,000 rows. This setting can be changed": confirma que no hay que suponer un tamaño fijo.
- Tailwind 4.3.3 (node_modules/tailwindcss/dist/lib.js): `wrap-anywhere` es `overflow-wrap: anywhere`.

**Pasada por el Orchestrator**:
- supabase.com/blog/postgrest-aggregate-functions: los agregados están desactivados por defecto, y activarlos exige `ALTER ROLE authenticator SET pgrst.db_aggregates_enabled = 'true'` (no se hace).
- supabase.com/docs/reference/javascript/range: 0-based e inclusivo; sin order puede comportarse de forma inesperada.
- supabase.com/docs/reference/javascript/select: ejemplo con `{ count: 'exact', head: true }`.
- El límite "Max rows" del servidor no está documentado en las páginas leídas.

## Dudas
1. He añadido un h2 "Resumen" encima de las tarjetas, por coherencia con "Nuevo movimiento" y "Tus movimientos". La asignación no lo pedía; si no se quiere, basta con quitar ese h2 en page.tsx.
2. Ingresos y Gastos salen siempre en verde y rojo, también cuando valen 0,00 €. Solo el saldo usa el color neutro en 0, como pide el criterio 4. Si se prefiere que Ingresos y Gastos vayan también en zinc, es un cambio de dos clases.
3. Pido count en todas las peticiones, no solo en la primera. Cuesta un COUNT(*) por bloque, pero permite detectar si los datos cambian entre bloques. Con menos de 1000 movimientos solo hay una petición.
4. El saldo negativo usa el signo "-" que pone Intl es-ES. La lista usa "−" (U+2212) para los gastos. Los he dejado distintos a propósito, para no reescribir lo que da Intl.

---

# Informe de Testing (literal)

T-005 · Ronda 1

**Revisado:** cambios sin commit sobre HEAD 147819c.
- `C:\ia\claude\bolsillo\src\app\panel\summary-cards.tsx` (nuevo)
- `C:\ia\claude\bolsillo\src\app\panel\page.tsx` (+16 líneas: un import y una sección)
- `C:\ia\claude\bolsillo\src\lib\transactions.ts` (+50 líneas, solo añadidos)

README.md (solo una línea en blanco) y .claude/launch.json no son de Develop. No he abierto .env.local.

**Comprobaciones y resultado**

1. **Alcance (git status y git diff --stat HEAD).** Solo cambian los tres archivos de arriba, más README.md y launch.json, que son ajenos. En transactions.ts el diff tiene solo líneas añadidas. No cambian actions.ts, transaction-form.tsx, transaction-list.tsx, delete-button.tsx, layout, /login, proxy, portada, next.config.ts, package.json, package-lock.json ni el esquema. Greeting y cerrar sesión siguen igual. OK.

2. **lint y build, ejecutados por mí.** `npm run lint` termina con código 0. `npm run build` termina con código 0: Next 16.4.6, TypeScript sin errores, /panel sale como Partial Prerender (◐). OK.

3. **cacheComponents.** Las tarjetas tienen su propio `<Suspense>` con "Calculando totales…" y van entre el saludo y "Nuevo movimiento". SummaryCards hace `await connection()` antes de `createClient()` y `getClaims()`. Buscar "use cache|getSession" en src/ solo encuentra un comentario que ya existía en src/lib/supabase/server.ts:5. No hay ninguna directiva. OK.

4. **Tabla (A), comprobada fila por fila leyendo amountToCents, addToTotals, formatCents y el saldo.** El formateador `euros` es Intl es-ES EUR, con 2 decimales por defecto.

| Entrada | Lo que hace el código | Coincide con Develop |
|---|---|---|
| "0.10" + "0.20" | 0·100 + Number("10") = 10, y 20. Suma 30, formatCents da "0,30 €". Saldo 30 > 0, verde | Sí |
| 12.5 (number) | String da "12.5", match[2] = "5", padEnd da "50", 1200 + 50 = 1250, "12,50 €" | Sí |
| "12.50" | 1250, "12,50 €" | Sí |
| "999999999.99" | 99999999900 + 99 = 99999999999, safe integer, "999.999.999,99 €" | Sí |
| 100.00 − 150.25 | 10000 − 15025 = −5025, "-50,25 €" (guion de Intl), rojo | Sí |
| Sin movimientos | count = 0, en la primera vuelta received === expected y sale con break. Totales 0/0, "0,00 €" en las tres. Saldo 0 − 0 = 0 (no −0), zinc | Sí |
| "1e5", "-3", "1.234" | No encajan con `/^(\d+)(?:\.(\d{1,2}))?$/`, devuelve null y sale el mensaje de error | Sí |
| NaN, 1e21, null, "", " 12" | "NaN", "1e+21", tipo no válido y textos que no encajan: todos null | Sí |
| 1234 € | "1234,00 €": es-ES no agrupa con 4 cifras | Sí |

- **Riesgo de String(number):** numeric(12,2) va de 0,01 a 9.999.999.999,99. Ahí String() siempre da notación decimal: solo usa exponente por debajo de 1e-6 o desde 1e21, así que un caso como 1e-7 no puede darse. Además da la representación más corta que identifica el número. Con 12 cifras significativas o menos, eso es exactamente el decimal original, con 2 decimales como mucho (0.1 da "0.1", 0.07 da "0.07"). 0 (y -0) dan "0", que vale 0. No hay ningún valor válido que el regex rechace o lea mal. Las multiplicaciones son de enteros por 100 y quedan muy por debajo de 2^53. No hay discrepancias.

5. **Bucle de bloques (loadTotals).**
- Usa `select("type, amount", { count: "exact" })`, `.eq("user_id", userId)` con `claims.sub`, `.order("id", { ascending: true })` y `.range(from, from + PAGE_SIZE - 1)`. PAGE_SIZE vale 1000 y MAX_PAGES vale 200, con justificación en un comentario.
- Siempre termina: es un `for` acotado por MAX_PAGES. Sale antes con un bloque vacío, al completar count o con return null por error, count null, data que no es array, count distinto entre bloques o filas no válidas.
- `from` y `received` avanzan con `data.length`, así que los bloques más pequeños que 1000 funcionan bien.
- Al salir comprueba `expected === null || received !== expected` y devuelve null. Eso cubre el tope alcanzado sin completar, el bloque vacío antes de tiempo y las filas de más.
- Nunca se devuelven totales parciales: o están completos o salen null y el mensaje "No se han podido calcular los totales.". OK.

6. **Limitación (B).** Describe bien el código: count se pide y se compara en cada bloque. Un borrado más una creación entre dos bloques dejan count igual y no se detecta. Un matiz sin importancia: "solo ocurre con más de 1000 movimientos" supone que el límite de filas del servidor es de 1000 o más. Si fuera menor, habría varias peticiones antes, y entonces la limitación también se aplicaría. Esto no lo considero defecto.

7. **Colores.** Ingresos siempre verde y Gastos siempre rojo. El Saldo es verde si es > 0, rojo si es < 0 y zinc-900/zinc-100 si vale exactamente 0. Todos tienen variante dark. OK.

8. **Seguridad.**
- Solo se usa el cliente de servidor (`@/lib/supabase/server`) y hay `.eq('user_id')`, además de la RLS.
- summary-cards.tsx no lleva 'use client'. Al HTML solo llegan tres textos ya formateados.
- No se muestra error.message ni datos crudos.
- No hay `any`: se usan `unknown` y guardas de tipo. OK.

9. **Responsive y diseño.** `<dl>` con `grid-cols-1` y `sm:grid-cols-3`. Las tarjetas llevan `min-w-0` y `wrap-anywhere`, el importe es text-2xl en móvil y sm:text-lg en tres columnas, todo dentro del max-w-xl que ya había. Por el código no debería desbordar, pero no lo he comprobado visualmente.

10. **Documentación local citada:** connection, refresh, la guía de auth con cache components, data-security y los tipos de postgrest-js. OK.

**Defectos:** ninguno.

Hay dos detalles de criterio que Develop ya planteó como dudas y que no son defectos:
- Ha añadido un h2 "Resumen" que la asignación no pedía (page.tsx, en la nueva sección).
- El saldo negativo usa "-" (el que pone Intl) y la lista usa "−" (U+2212).

Decide el Orchestrator o el usuario.

**Queda para la prueba manual del usuario (npm run dev):**
- Con una cuenta sin movimientos, ver "0,00 €" en las tres tarjetas y el saldo en color neutro.
- Crear un ingreso y un gasto, y comprobar que las cifras se actualizan solas y que el color del saldo cambia (verde, rojo y neutro en 0).
- Borrar un movimiento y comprobar que se recalculan.
- Ver la pantalla a 375 px (una columna, sin desbordes) y a unos 640 px (tres columnas), en modo claro y oscuro.
- Comprobar que otra cuenta (la demo) solo ve sus propios totales.

**Veredicto:** Aprobado.
