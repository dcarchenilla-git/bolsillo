# T-001 · Ronda 1

## Entrega de Develop (literal)

T-001 · Ronda 1

Archivos cambiados:
- C:\ia\claude\bolsillo\src\app\page.tsx
- C:\ia\claude\bolsillo\src\app\layout.tsx
(git diff --stat: 2 archivos, 11 inserciones, 68 borrados. No se ha tocado ningún otro archivo, y tampoco AGENTS.md, next.config.ts ni globals.css.)

Qué se hizo:
- Antes de empezar leí node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md y 14-metadata-and-og-images.md (sección de metadatos estáticos).
- page.tsx: he quitado todo el contenido de la plantilla, incluido el import de next/image, los logos, las imágenes y todos los enlaces. Ahora es un Server Component, sin 'use client', con un <main> que muestra:
  - un <h1> "Bolsillo"
  - un <p> "Lleva el control de tus ingresos y gastos de forma sencilla."
  No tiene enlaces de ninguna clase.
  - Estilos con Tailwind: el contenido va centrado (flex flex-1 items-center justify-center, text-center) con padding px-6 py-16.
  - Tamaños: título text-4xl que pasa a sm:text-5xl, y párrafo con max-w-md text-lg que pasa a sm:text-xl.
  - Variantes dark: como en la plantilla.
- layout.tsx: lang="en" pasa a lang="es", metadata.title = "Bolsillo" y metadata.description = "Bolsillo te ayuda a llevar el control de tus ingresos y gastos.". El resto del archivo, con las fuentes Geist y las clases de html y body, no cambia.
- No se ha añadido ninguna dependencia. No he hecho commits, push ni cambios de rama.

Resultado literal de lint y build:
```
> bolsillo@0.1.0 lint
> eslint


> bolsillo@0.1.0 build
> next build

▲ Next.js 16.4.6 (Turbopack)
✓ Running next.config.ts took 23ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 530ms
  Running TypeScript ...
  Finished TypeScript in 1038ms ...
  Collecting page data using 5 workers ...
  Generating static pages using 5 workers (0/4) ...
  Generating static pages using 5 workers (1/4) 
  Generating static pages using 5 workers (2/4) 
  Generating static pages using 5 workers (3/4) 
✓ Generating static pages using 5 workers (4/4) in 413ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found


○  (Static)  prerendered as static content
```
(lint no muestra ningún error ni aviso.)

Dudas:
1. Recursos de la plantilla que quedan sin usar en public/: next.svg y vercel.svg ya no se usan en ningún sitio. Probablemente tampoco se usan file.svg, globe.svg ni window.svg, que suelen venir con create-next-app, pero no he listado public/ para comprobarlo. No he borrado nada, como pedía la tarea: decide el usuario.
2. No he comprobado la página en un navegador. El aspecto en móvil (~375 px) y en escritorio sale solo de leer las clases de Tailwind.
3. Git avisa "LF will be replaced by CRLF" en los dos archivos. Solo afecta a los finales de línea; el diff de contenido es el esperado.

## Informe de Testing (literal)

T-001 · Ronda 1

Revisado: los cambios sin commit del working tree frente al commit de53cc3. Hay dos archivos modificados, C:\ia\claude\bolsillo\src\app\page.tsx y C:\ia\claude\bolsillo\src\app\layout.tsx. También hay un archivo sin seguimiento, C:\ia\claude\bolsillo\docs\evidencias\T-001-ronda-1.md. No es de Develop: es el archivo de evidencias que el paso 5 del flujo de docs/workflow.md asigna al Orchestrator.

Comprobaciones y resultado:
1. Contenido de la plantilla: cumple. page.tsx ya no importa next/image y no tiene logos, imágenes de Next/Vercel ni enlaces a Vercel, docs, templates o learn.
2. Título y frase: cumple. Hay un `<h1>` con "Bolsillo" y un `<p>` con "Lleva el control de tus ingresos y gastos de forma sencilla."
3. Sin enlaces: cumple. No hay `<a>` ni `<Link>`.
4. Tailwind, sencilla y responsive: cumple. Usa solo clases de Tailwind, centra el contenido con flex y deja margen lateral con `px-6`. El texto crece en pantallas grandes (`sm:text-5xl`, `sm:text-xl`) y no tiene anchos fijos, así que no desborda a unos 375 px. Lo he comprobado leyendo el código, no en un navegador.
5. layout.tsx: cumple. Tiene `lang="es"`, `title: "Bolsillo"` y `description: "Bolsillo te ayuda a llevar el control de tus ingresos y gastos."`. El resto del archivo no ha cambiado.
6. Dependencias y reglas: cumple. package.json, package-lock.json, AGENTS.md, next.config.ts y globals.css no tienen cambios. No se ha borrado nada de public/. No hay commits nuevos; HEAD sigue en de53cc3.
7. Lint y build (los he ejecutado yo):
   - `npm run lint`: termina sin errores ni avisos (código de salida 0).
   - `npm run build`: termina bien (código de salida 0). Next.js 16.4.6 con Turbopack: "Compiled successfully", TypeScript sin errores, y las rutas / y /_not-found se generan como páginas estáticas.
- Directrices 4 y 5: no hay `any` ni `'use client'`; ambos archivos son Server Components. La tarea no lee sesión ni toca datos de usuario, así que RLS no aplica aquí.
- Alcance: Develop no ha hecho nada fuera de lo pedido.

Defectos: ninguno.

Veredicto: Aprobado.
