# T-007 · Ronda 1

## Asignación (resumen)

Mejora visual de la portada y del login, aprobada por el usuario. En la portada: título, frase, botones "Entrar" y "Crear cuenta" que llevan a /login, tres tarjetas breves y una tarjeta de ejemplo con cifras ficticias. En /login: tarjeta más cuidada, enlace "← Volver al inicio" y una línea sobre "Crear cuenta".

Decisiones del usuario:
- A: en la fila de T-006 del README, "este commit" pasa a `28cc584`. El Orchestrator comprobó antes con `git log --oneline` que ese commit es el de T-006.
- B: login-form.tsx solo puede cambiar en atributos className.

Restricciones: la portada no lee la sesión; sin dependencias, imágenes ni fuentes nuevas, y solo Tailwind; ningún 'use cache' ni getSession(); accesible; responsive a 375 px; la portada / debe seguir siendo estática (○).

## Entrega de Develop (literal)

T-007 · Ronda 1

La portada y /login tienen el diseño nuevo, y lint y build terminan con código 0. No he arrancado la app ni la he visto en el navegador: el aspecto, los 375 px y el modo oscuro solo los he comprobado leyendo el código.

## Archivos cambiados
- C:\ia\claude\bolsillo\src\app\page.tsx
- C:\ia\claude\bolsillo\src\app\login\page.tsx
- C:\ia\claude\bolsillo\src\app\login\login-form.tsx (solo valores de className)
- C:\ia\claude\bolsillo\README.md

## Qué se hizo

**Comprobaciones previas**
- **Guía de diseño:** no hay ninguna en el repositorio fuera de node_modules. Lo comprobé de dos formas:
  - `git ls-files` solo muestra README, CLAUDE.md, AGENTS.md, docs/workflow.md, docs/supabase-schema.sql y docs/evidencias/*.
  - Busqué con `find` archivos cuyo nombre tuviera design, style o guia, excluyendo node_modules, .next y .git, y no salió ninguno.
- **Lo que uso de link.md** (node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md):
  - Importar con `import Link from 'next/link'` y usarlo con `<Link href="/dashboard">Dashboard</Link>`. `href` es la única prop obligatoria.
  - La nota "Good to know": "`<a>` tag attributes such as `className` or `target="_blank"` can be added to `<Link>` as props and will be passed to the underlying `<a>` element." Así les doy el aspecto de botón y el foco visible.
  - No paso `prefetch`, así que queda el valor por defecto `"auto"`. Con Partial Prefetching activado (lo indica el build), la guía dice que "`auto` prefetches the per-route App Shell". No ha hecho falta cambiar nada.
- He leído src/app/panel/summary-cards.tsx y src/app/login/login-form.tsx, y copio sus clases zinc, de borde y de tarjeta.

**src/app/page.tsx**
- **Sección principal:** un único `<h1>` "Bolsillo", la frase de antes y dos `<Link href="/login">` con aspecto de botón:
  - "Entrar": fondo zinc-950, o zinc-50 en modo oscuro.
  - "Crear cuenta": con borde.
- **Tres tarjetas** en un `<ul>` con `grid-cols-1 sm:grid-cols-3` (una columna en móvil, tres en pantallas anchas). Llevan exactamente los títulos pedidos en `<h2>` y una frase corta cada una.
- **Tarjeta de ejemplo:**
  - Es un `<section aria-labelledby="ejemplo-titulo" aria-describedby="ejemplo-nota">` con la etiqueta visible "Ejemplo" (en un `<h2>`).
  - Lleva la nota visible "Las cifras son ficticias: así se ve el resumen de tu panel." Al ser texto visible, también la leen los lectores de pantalla, y además está enlazada con aria-describedby.
  - Las cifras van en un `<dl>` con la misma estructura y las mismas clases que summary-cards: ingresos en green-700 / dark:green-400, gastos en red-700 / dark:red-400 y saldo en zinc-900 / dark:zinc-100.
  - Son textos fijos: "950,00 €", "412,35 €" y "537,65 €", con espacio duro antes de €.
- **Sin sesión:** no hay connection(), 'use cache', getSession(), createClient ni cookies. Lo comprobé con grep, que no encontró nada (código de salida 1).
- Todos los enlaces llevan `focus-visible:outline-2 outline-offset-2 outline-zinc-950 / dark:outline-zinc-50`. Los textos secundarios usan zinc-600/500 sobre blanco y zinc-400 sobre zinc-900, igual que en el panel.

**src/app/login/page.tsx**
- Añadido `import Link from "next/link"`.
- Enlace "← Volver al inicio" con `<Link href="/">` y foco visible.
- Tarjeta con borde zinc-200 / dark zinc-800, fondo blanco / dark zinc-900, rounded-xl, shadow-sm, px-6 py-8.
- Debajo del h1 hay una línea nueva: "Si es la primera vez que entras, escribe tu correo y una contraseña y pulsa «Crear cuenta»."
- La función RedirectIfSignedIn y su `<Suspense fallback={null}>` no han cambiado: siguen en el mismo sitio, como hijo directo de `<main>`.

**src/app/login/login-form.tsx**
El diff tiene solo 3 líneas cambiadas, todas en valores de clases:
- En la constante `inputClass` añado los estados focus-visible y cambio el fondo oscuro de dark:bg-zinc-900 a dark:bg-zinc-950, para que el campo se distinga de la tarjeta, que ahora es zinc-900.
- En el className de los dos botones añado focus-visible y dark:focus-visible.
- No he tocado lógica, textos, nombres, imports ni estructura.

**README.md**
- (a) En la sección 3, una línea nueva: "**Portada:** explica qué es Bolsillo y lleva al login ([src/app/page.tsx](src/app/page.tsx))."
- (b) Fila de T-007 añadida, exactamente con el texto pedido.
- (c) En la fila de T-006, "este commit" pasa a ser `28cc584`.
- Nada más del README.

## Resultado literal de lint y build
```
> bolsillo@0.1.0 lint
> eslint

EXIT lint: 0

> bolsillo@0.1.0 build
> next build

▲ Next.js 16.4.6 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 27ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 658ms
  Running TypeScript ...
  Finished TypeScript in 1163ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6) 
  Generating static pages using 7 workers (2/6) 
  Generating static pages using 7 workers (4/6) 
✓ Generating static pages using 7 workers (6/6) in 498ms
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
/ sigue como ○ (estática).

## Dudas
1. **Formato de importe:** el ejemplo de la asignación era "1.500,00 €", pero el panel formatea con `Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" })`. Lo comprobé en Node y da "1500,00 €", sin punto en las cifras de 4 dígitos (y "12.500,00 €" en las de 5). Para que el ejemplo sea idéntico a lo que muestra el panel y no se note la diferencia, he usado importes de menos de 1000 €. Si queréis una cifra como 1.500,00 €, ¿en qué formato se escribe: el de la asignación o el del panel?
2. **Fondo oscuro de los campos:** cambié dark:bg-zinc-900 por dark:bg-zinc-950 en `inputClass`. Es un valor de una constante de clases, así que entra en lo permitido, pero lo menciono por si Testing esperaba solo añadidos.
3. **Finales de línea:** git avisa "LF will be replaced by CRLF" en los 4 archivos. Es el aviso normal de git en Windows; el diff solo muestra las líneas que he cambiado.
4. **.claude/launch.json:** sigue sin seguimiento en git y no lo he tocado.

---

# Informe de Testing (literal)

T-007 · Ronda 1

Resultado: Aprobado. No he encontrado defectos. Yo mismo he ejecutado lint y build y los dos terminan con código 0. En el build, / sigue saliendo como ○ (estática).

## Revisado
Los cambios sin commit sobre HEAD 28cc584, que afectan a 4 archivos: README.md, src/app/page.tsx, src/app/login/page.tsx y src/app/login/login-form.tsx. `git diff --stat` da 143 líneas añadidas y 16 quitadas. No he revisado .claude/launch.json ni docs/evidencias/T-007-ronda-1.md, porque no son de Develop.

## Comprobaciones y resultado

**1. Portada** (C:\ia\claude\bolsillo\src\app\page.tsx): cumple.
- Hay un solo `<h1>`, "Bolsillo" (`grep -c "<h1"` da 1), y la frase "Lleva el control de tus ingresos y gastos de forma sencilla."
- Hay dos `<Link href="/login">` importados de `next/link`, con los textos "Entrar" y "Crear cuenta".
- Las tres tarjetas están en un `<ul>` con `<h2>` y tienen los títulos exactos: "Apunta tus ingresos y gastos", "Controla tu saldo" y "Tus datos son solo tuyos".
- Tarjeta de ejemplo:
  - Es un `<section aria-labelledby="ejemplo-titulo" aria-describedby="ejemplo-nota">`.
  - La etiqueta visible "Ejemplo" va en un `<h2>`.
  - La nota visible "Las cifras son ficticias: así se ve el resumen de tu panel." es texto normal, así que la leen los lectores de pantalla, y además está enlazada con aria-describedby.
- Colores: son idénticos a los de summary-cards.tsx (ingresos `text-green-700 dark:text-green-400`, gastos `text-red-700 dark:text-red-400`, saldo `text-zinc-900 dark:text-zinc-100`). Las clases de `dl`, `dt` y `dd` también son las mismas.
- Las cifras son textos fijos y llevan U+00A0 (espacio duro) antes de €, como en el formato es-ES; lo comprobé con grep -P.

**2. La portada no lee la sesión: cumple.**
Ejecuté `grep -nE "use cache|getSession|connection|createClient|cookies|getClaims|headers|supabase" src/app/page.tsx`. El resultado literal fue vacío y `grep exit: 1`, es decir, ninguna coincidencia. El único import es `next/link`.

**3. Build:** / sale como `┌ ○ /`. /login y /panel salen como ◐, igual que antes.

**4. /login** (C:\ia\claude\bolsillo\src\app\login\page.tsx): cumple.
- La tarjeta es nueva, con rounded-xl, borde, fondo blanco o zinc-900 en oscuro, shadow-sm y px-6 py-8.
- Lleva `<Link href="/">` con el texto "← Volver al inicio".
- Lleva la línea «Si es la primera vez que entras, escribe tu correo y una contraseña y pulsa «Crear cuenta».»
- Según el diff, `RedirectIfSignedIn` y `<Suspense fallback={null}>` no han cambiado, y Suspense sigue siendo hijo directo de `<main>`.
- El único import nuevo es `import Link from "next/link"`.

**5. login-form.tsx: solo cambian clases.** Hay 3 líneas quitadas y 3 añadidas:
- L7, constante `inputClass`: añade `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 … dark:focus-visible:outline-zinc-50` y cambia `dark:bg-zinc-900` por `dark:bg-zinc-950`.
- L57, className del botón "Entrar": añade las mismas clases de focus-visible.
- L66, className del botón "Crear cuenta": añade las mismas clases de focus-visible.

No cambian la lógica, los nombres de los campos, los textos, los imports ni la estructura JSX.

**6. Accesibilidad** (leyendo el código): cumple.
- Foco visible: tienen focus-visible los dos Link de la portada (con la constante `focusClass`), el enlace "Volver al inicio", los dos botones del formulario y los dos campos.
- Hay un único `<h1>` por página. La página de login tiene 1, y login-form no tiene ninguno.
- Contraste razonable. Las parejas son zinc-600 sobre blanco, zinc-500 sobre zinc-50, zinc-400 sobre zinc-900 o negro, y green-700 y red-700 sobre zinc-50. Son las mismas que ya usaba el panel.
- Los textos son claros y la estructura semántica es correcta (section, ul/li, dl/dt/dd).

**7. Responsive a 375 px** (leyendo el código): cumple.
- No hay anchos fijos: solo `w-full` con `max-w-*` y `px-6`.
- En móvil todo va en una columna: tarjetas `grid-cols-1 sm:grid-cols-3`, cifras del ejemplo `grid-cols-1 sm:grid-cols-3` y botones `flex-col sm:flex-row`.
- Las tarjetas y las cifras llevan `min-w-0` y `wrap-anywhere`. `wrap-anywhere` existe en Tailwind 4.3.3 y ya se usaba en el panel.
- En /login quedan unos 279 px útiles a 375 px, y los botones se apilan.

**8. Solo Tailwind: cumple.**
- `git diff --quiet` sobre package.json y package-lock.json termina con código 0, es decir, sin cambios.
- `git status --porcelain --untracked-files=all` no muestra imágenes ni fuentes nuevas.

**9. README.md: cumple.** El diff tiene exactamente los tres cambios pedidos:
- (a) La línea «**Portada:** explica qué es Bolsillo y lleva al login …» en la sección 3.
- (b) La fila de T-007 con "este commit".
- (c) En la fila de T-006, "este commit" pasa a `28cc584`.

`git log --oneline` confirma que 28cc584 es «docs: reescribir README.md (T-006)».

**10. Archivos protegidos: cumple.** Ejecuté `git diff --quiet` sobre next.config.ts, src/proxy.ts, src/lib, src/app/login/actions.ts, src/app/panel, src/app/layout.tsx, AGENTS.md y docs/supabase-schema.sql, y terminó con código 0. git status solo muestra los 4 archivos modificados y los 2 archivos sin seguimiento ya conocidos.

**11. Lint y build, ejecutados por mí:**
```
> eslint
EXIT lint: 0
✓ Compiled successfully in 428ms
Route (app)
┌ ○ /
├ ○ /_not-found
├ ◐ /login
└ ◐ /panel
EXIT build: 0
```

**12. Las dudas de Develop:**
- **Formato de importe:** está bien resuelto. El panel usa `formatCents`, que llama a `Intl.NumberFormat` en es-ES, y es-ES no pone punto de miles en números de 4 cifras (sale "1500,00 €"). Con cifras de menos de 1000 € el ejemplo es idéntico a lo que muestra el panel. Si el usuario quiere "1.500,00 €", tendrá que decidir el formato, pero no es un defecto.
- **dark:bg-zinc-900 a dark:bg-zinc-950:** es un valor dentro de una constante de clases, así que entra en lo permitido (decisión B, criterio 5). Además tiene sentido: sin el cambio, en modo oscuro el campo tendría el mismo fondo que la tarjeta nueva (zinc-900).
- **Avisos de CRLF:** son el aviso normal de git en Windows por la conversión de finales de línea, no un problema del código. El diff solo muestra las líneas reales.

## Defectos
Ninguno.

## Veredicto
Aprobado.

## Lo que no puedo comprobar sin abrir la app en el navegador
- El aspecto real, el espaciado y la sombra de la tarjeta de login.
- Que no haya scroll horizontal a 375 px de verdad.
- Cómo se ve el modo oscuro.
- Que el contorno de foco se vea al navegar con Tab.
- Cómo lo lee un lector de pantalla real (aria-describedby).
- Que los dos enlaces lleven a /login, y "Volver al inicio" a /, al hacer clic.
- Que con sesión iniciada /login siga mandando a /panel.
- Que el formulario siga entrando y creando cuentas. El código de esa parte no ha cambiado, pero no lo he probado.

Archivos relevantes:
- C:\ia\claude\bolsillo\src\app\page.tsx
- C:\ia\claude\bolsillo\src\app\login\page.tsx
- C:\ia\claude\bolsillo\src\app\login\login-form.tsx
- C:\ia\claude\bolsillo\README.md
- C:\ia\claude\bolsillo\src\app\panel\summary-cards.tsx
