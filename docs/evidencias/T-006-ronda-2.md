# T-006 · Ronda 2

## Motivo de la ronda

Testing rechazó la ronda 1 por un defecto de formato en README.md:133 (faltaba un salto de línea y la viñeta "AGENTS.md se conserva" quedaba pegada a la anterior). El Orchestrator pidió además aplicar la observación de Testing sobre la línea ~97: el aviso de Date.now() salió al crear una cuenta, según la precisión del usuario en docs/evidencias/T-003-ronda-2.md. Informe de la ronda 1: docs/evidencias/T-006-ronda-1.md.

## Entrega de Develop (literal)

T-006 · Ronda 2

He arreglado los dos puntos en README.md. Lint y build terminan con EXIT 0. No he tocado ningún otro archivo, no he abierto .env.local y no he hecho commits ni push.

## Archivos cambiados
- C:\ia\claude\bolsillo\README.md (es el único)

## Qué se hizo

1. Defecto de la línea 133: faltaba un salto de línea.
   - Antes (una sola línea, la 133):
     `- **Solo la clave publishable:** la app usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y nunca la secret key.- **AGENTS.md se conserva:** viene del commit inicial de Create Next App (`c5249c0`), y el propio archivo dice que `next dev` lo vuelve a escribir.`
   - Después (dos líneas, la 133 y la 134):
     `- **Solo la clave publishable:** la app usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y nunca la secret key.`
     `- **AGENTS.md se conserva:** viene del commit inicial de Create Next App (`c5249c0`), y el propio archivo dice que `next dev` lo vuelve a escribir.`
   - Por eso, a partir de aquí todas las líneas del archivo bajan un número.

2. Observación de la línea 97 (el texto sale de T-003-ronda-2.md, línea 5: "al pulsar en crear cuenta"):
   - Antes: `- **Qué pasó:** al probar T-003 con `npm run dev`, el usuario vio al entrar en `/panel` un aviso "Blocking Route":`
   - Después: `- **Qué pasó:** al probar T-003 con `npm run dev`, el usuario vio al crear una cuenta (el registro lleva a `/panel`) un aviso "Blocking Route":`

Para comprobarlo, volví a leer las líneas 97 y 133-135 con sed después de editar.

## Resultado literal de lint y build
```
> bolsillo@0.1.0 lint
> eslint

EXIT lint: 0

> bolsillo@0.1.0 build
> next build

▲ Next.js 16.4.6 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 20ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 408ms
  Running TypeScript ...
  Finished TypeScript in 990ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6) 
  Generating static pages using 7 workers (2/6) 
  Generating static pages using 7 workers (4/6) 
✓ Generating static pages using 7 workers (6/6) in 487ms
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
Ninguna.

---

# Informe de Testing (literal)

T-006 · Ronda 2

**Revisado:** no hay commit nuevo; HEAD sigue en 1d659ed. Revisé el README.md sin commit, con el archivo completo, y lo comparé con mi informe de la ronda 1 (C:\ia\claude\bolsillo\docs\evidencias\T-006-ronda-1.md) y con la entrega de Develop (C:\ia\claude\bolsillo\docs\evidencias\T-006-ronda-2.md). No abrí .env.local y no modifiqué ningún archivo.

## Comprobaciones y resultado

1. **Defecto corregido:** sí. Ahora son dos viñetas separadas:
   - La línea 133 es "- **Solo la clave publishable:** … nunca la secret key." y termina ahí.
   - La línea 134 es "- **AGENTS.md se conserva:** …".
   - La línea 135 sigue con "Por eso no se toca (regla 2 de CLAUDE.md)."
2. **Aviso de Date.now() (línea 97):** dice "el usuario vio al crear una cuenta (el registro lleva a `/panel`) un aviso "Blocking Route"".
   - Coincide con T-003-ronda-2.md, línea 5: "El aviso fue al registrarme" y "al pulsar en crear cuenta, no al pulsar en entrar".
   - El paréntesis no añade nada nuevo: esa misma línea cuenta que el aviso salió al llegar a /panel, y ya lo había comprobado en la ronda 1.
   - El resto de la sección 6 (líneas 98-106) sigue igual que lo que revisé.
3. **No ha cambiado nada más:**
   - `git diff --stat` da +166/−23. En la ronda 1 daba +165/−23, así que solo hay una línea más, que es la del salto de línea. El cambio de la línea 97 no cambia el número de líneas.
   - Las líneas que cité en la ronda 1 bajan justo una a partir de la 133: "secret" estaba en 133 y 150 y ahora en 133 y 151; la sección demo pasa de la 178 a la 179.
   - Al releer el README entero, el contenido coincide con lo que aprobé.
   - Las secciones 1 a 10 están todas y en orden (líneas 3, 11, 27, 43, 77, 93, 119, 139, 164 y 177).
   - Todos los enlaces relativos apuntan a archivos o carpetas que existen.
   - No hay resultados para "launch", "sb_", "eyJ", "service_role" ni "password".
   - "@" solo aparece en los nombres de paquete @supabase (líneas 21, 22 y 121), así que no hay correos.
   - "secret" solo aparece en las líneas 133 y 151, para explicar que no se usa.
   - No hay contraseñas.
4. **git status:** solo aparece ` M README.md`. Además, sin seguimiento, están .claude/launch.json, docs/evidencias/T-006-ronda-1.md, docs/evidencias/T-006-ronda-2.md, docs/evidencias/incidente-vercel.md y docs/supabase-schema.sql. Esos archivos son del Orchestrator o del usuario. Develop solo tocó README.md.
5. **Lint y build (los ejecuté yo):**
   - `npm run lint`: EXIT 0.
   - `npm run build`: EXIT 0. Rutas: / ○, /_not-found ○, /login ◐, /panel ◐, más el Proxy.

Sigue en pie la nota de la ronda 1: incidente-vercel.md y supabase-schema.sql no están en git. Si no entran en el commit de T-006, sus enlaces del README saldrán rotos en GitHub. Lo decide el usuario.

## Defectos
Ninguno.

## Veredicto
Aprobado.
