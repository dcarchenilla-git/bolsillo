# Bolsillo

## 1. Qué es Bolsillo

Bolsillo es una aplicación web para llevar el control de tus ingresos y gastos.
Cada persona crea su cuenta, apunta sus movimientos y ve un resumen con lo que
ha ingresado, lo que ha gastado y el saldo.

URL pública (dato aportado por el usuario): https://bolsillo-tau.vercel.app/

## 2. Stack

Versiones tomadas de [package.json](package.json):

| Pieza | Versión |
|---|---|
| Next.js (App Router, código en `src/`) | 16.4.6 |
| React / React DOM | 19.3.0 |
| TypeScript | ^5 |
| Tailwind CSS | 4.3.3 |
| @supabase/ssr | ^0.12.7 |
| @supabase/supabase-js | ^2.119.2 |

- Base de datos y autenticación: Supabase.
- Despliegue: Vercel (configurado por el usuario).

## 3. Funcionalidades

Alcance de la versión mínima según [CLAUDE.md](CLAUDE.md), y lo que hay implementado en `src/`:

- **Portada:** explica qué es Bolsillo y lleva al login ([src/app/page.tsx](src/app/page.tsx)).
- **Cuentas:** registro, acceso y cierre de sesión con correo y contraseña
  ([src/app/login/](src/app/login/), [src/app/panel/actions.ts](src/app/panel/actions.ts)).
- **/panel protegido:** sin sesión, el proxy manda a `/login`; con sesión, `/login` manda a `/panel`
  ([src/proxy.ts](src/proxy.ts), [src/lib/supabase/proxy.ts](src/lib/supabase/proxy.ts)).
- **Movimientos:** crear, ver y borrar ingresos y gastos.
- **Categorías fijas:** la misma lista para todos, definida en [docs/supabase-schema.sql](docs/supabase-schema.sql).
- **Resumen:** tarjetas con ingresos, gastos y saldo ([src/app/panel/summary-cards.tsx](src/app/panel/summary-cards.tsx)).
- **RLS:** cada usuario solo puede leer, crear y borrar sus propios movimientos.
- **Responsive:** diseño pensado para móvil (unos 375 px) y escritorio.

Fuera de alcance: presupuestos, filtros, gráficos, editar movimientos y gestionar categorías.

## 4. Cómo se ha construido: tres agentes

El proyecto se ha hecho con tres agentes de Claude Code:

| Agente | Papel | Instrucciones |
|---|---|---|
| Orchestrator | Coordina y delega. No programa. | [CLAUDE.md](CLAUDE.md) |
| Develop | Implementa la tarea asignada y corrige lo que rechace Testing. | [.claude/agents/develop.md](.claude/agents/develop.md) |
| Testing | Revisa de forma independiente lo que entrega Develop. No edita. | [.claude/agents/testing.md](.claude/agents/testing.md) |

Las reglas comunes de los tres están en [CLAUDE.md](CLAUDE.md), y el ciclo y los formatos en [docs/workflow.md](docs/workflow.md).

**Cómo se coordinan** (ciclo de [docs/workflow.md](docs/workflow.md)):

1. El Orchestrator asigna una tarea `T-NNN` a Develop.
2. Develop implementa y entrega.
3. El Orchestrator pasa la entrega a Testing.
4. Testing emite un informe. Si es Rechazado, se vuelve al paso 2 con el informe; si es Aprobado o Bloqueado, se termina.
5. Como máximo hay 3 rondas; si se superan, la tarea queda Bloqueada y decide el usuario.
6. Cada informe se copia literal en [docs/evidencias/](docs/evidencias/), en un archivo `T-NNN-ronda-N.md`.

**Cómo se garantiza que Testing no edita:**

- Su ficha declara `tools: Read, Glob, Grep, Bash`. No tiene Edit ni Write.
- Limitación honesta: conserva Bash, y con Bash se podrían modificar archivos.
  Lo único que se lo impide es la regla escrita en su ficha: Bash solo para leer
  (git status/diff/log/show) y para `npm run lint` y `npm run build`, sin redirecciones ni comandos que creen, editen o borren archivos.

**Qué se comprobó y quién lo hizo:**

- Develop y Testing revisaron el código y ejecutaron solo `npm run lint` y `npm run build`.
  No arrancaron servidores (lo dicen ellos mismos en las evidencias).
- Las pruebas con la app en marcha las hizo el usuario a mano, en el navegador y con dos cuentas (dato aportado por el usuario).

## 5. Tareas

| Tarea | Título (de `git log`) | Rondas | Veredicto | Commit | Evidencias |
|---|---|---|---|---|---|
| T-001 | Portada sencilla de Bolsillo | 1 | Aprobado | `9c7699b` | [ronda 1](docs/evidencias/T-001-ronda-1.md) |
| T-002 | Conectar la app a Supabase sin login | 1 | Aprobado | `4b63cf9` | [ronda 1](docs/evidencias/T-002-ronda-1.md) |
| T-003 | Autenticación con correo y contraseña | 3 | Aprobado (las 3 rondas) | `e6827ca` | [ronda 1](docs/evidencias/T-003-ronda-1.md) · [ronda 2](docs/evidencias/T-003-ronda-2.md) · [ronda 3](docs/evidencias/T-003-ronda-3.md) |
| T-004 | Movimientos de ingresos y gastos en /panel | 1 | Aprobado | `147819c` | [ronda 1](docs/evidencias/T-004-ronda-1.md) |
| T-005 | Resumen de ingresos, gastos y saldo en /panel | 1 | Aprobado | `1d659ed` | [ronda 1](docs/evidencias/T-005-ronda-1.md) |
| T-006 | Reescribir README.md | 3 | Ronda 1: Rechazado (defecto de formato) · Ronda 2: Aprobado · Ronda 3: ajustes de contenido pedidos por el usuario tras leer el README | `28cc584` | [ronda 1](docs/evidencias/T-006-ronda-1.md) · [ronda 2](docs/evidencias/T-006-ronda-2.md) · [ronda 3](docs/evidencias/T-006-ronda-3.md) |
| T-007 | Mejora visual de la portada y del login | 1 | Aprobado | este commit | [ronda 1](docs/evidencias/T-007-ronda-1.md) |

En T-001 a T-005 Testing no rechazó ninguna ronda. El defecto de `Date.now()` lo encontró el usuario al probar la app,
y el único rechazo de Testing fue el de la ronda 1 de T-006, por un defecto de formato.

Por qué T-003 tuvo 3 rondas:

- **Ronda 1:** aprobada por Testing.
- **Ronda 2:** la abrió un defecto que encontró el usuario al probar la app: el aviso de `Date.now()` (ver sección 6).
- **Ronda 3:** no fue por un defecto. El usuario pidió una mejora: redirigir `/login` a `/panel` cuando ya hay sesión.

## 6. Qué falló y qué aprendimos

### El aviso de `Date.now()` ("Blocking Route")

- **Qué pasó:** al probar T-003 con `npm run dev`, el usuario vio al crear una cuenta (el registro lleva a `/panel`) un aviso "Blocking Route":
  Next.js había encontrado el valor inestable `Date.now()` durante el prerenderizado.
  Ni Develop ni Testing lo vieron leyendo el código en la ronda 1.
- **Causa:** `getClaims()` de Supabase compara la caducidad del token con `Date.now()`.
  Estar dentro de `<Suspense>` no bastaba, porque ese código seguía ejecutándose durante un prerenderizado.
- **Solución (ronda 2 de T-003):** `await connection()` antes de leer la sesión.
  Así ese código solo se ejecuta con la petición real.
- **Qué no se confirmó:** por qué el aviso salió solo al crear una cuenta y no al entrar con una cuenta existente.
  Develop lo atribuyó, sin comprobarlo, a que era la primera visita a `/panel` con sesión, y Testing lo dejó en "Qué no está confirmado"
  ([docs/evidencias/T-003-ronda-2.md](docs/evidencias/T-003-ronda-2.md)).
- **Lección:** leer el código y pasar lint y build no basta; hay que probar la app en marcha.
  Desde entonces, cada componente que lee la sesión empieza con `await connection()`.
- Evidencia: [docs/evidencias/T-003-ronda-2.md](docs/evidencias/T-003-ronda-2.md).

### Fallo en producción (Vercel) por variables de entorno ausentes

Resumen del relato aportado por el usuario en [docs/evidencias/incidente-vercel.md](docs/evidencias/incidente-vercel.md):

- **Qué pasó:** tras subir T-003, la web pública devolvía "Internal Server Error".
- **Diagnóstico:** los registros de ejecución de Vercel mostraban, en la ruta `/`, que faltaban la URL y la clave para crear el cliente de Supabase.
- **Causa:** `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no estaban definidas en Vercel.
  `.env.local` solo existía en el ordenador local, y git lo ignora.
- **Solución:** se añadieron las dos variables en Production y se volvió a desplegar. Después la web funcionó.
- **Lección:** el build y la revisión de código no pueden detectar variables que faltan en el entorno de producción.

## 7. Decisiones técnicas

- **`getClaims()` y no `getSession()`:** la documentación de `getSession` en los tipos de `@supabase/auth-js`
  avisa de no confiar en él y usar `getClaims()`, y la guía de Supabase para Next.js pide lo mismo en el servidor
  (ver [docs/evidencias/T-003-ronda-1.md](docs/evidencias/T-003-ronda-1.md)). En `src/` no se llama a `getSession`.
- **RLS con permisos mínimos:** en la tabla de movimientos, el rol `authenticated` solo tiene `select`, `insert` y `delete`,
  y cada política exige que la fila sea del propio usuario. No hay permiso de `update`, porque editar movimientos está fuera de alcance.
  Las categorías son de solo lectura.
- **Cache Components se mantiene activado:** lo que lee cookies o sesión va dentro de `<Suspense>` y empieza con `await connection()`.
  Nunca se lee la sesión dentro de `'use cache'`.
- **Sumas en céntimos enteros:** los importes se pasan a céntimos y se suman como enteros; solo se divide al formatear.
  Así se evitan errores como 0,1 + 0,2 = 0,30000000000000004.
  Los movimientos se leen por bloques con `range()`: bloques de 1000 y un tope de 200 bloques
  ([src/app/panel/summary-cards.tsx](src/app/panel/summary-cards.tsx)).
- **Solo la clave publishable:** la app usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y nunca la secret key.
- **AGENTS.md se conserva:** viene del commit inicial de Create Next App (`c5249c0`), y el propio archivo dice que `next dev` lo vuelve a escribir.
  Por eso no se toca (regla 2 de [CLAUDE.md](CLAUDE.md)).
- **Esquema de la base de datos:** según el usuario, se aplicó a mano en el editor SQL de Supabase.
  [docs/supabase-schema.sql](docs/supabase-schema.sql) es la copia de ese script.

## 8. Cómo ejecutarlo en local

Requisitos: Node.js 20.9 o superior (lo exige Next.js 16.4.6: campo `engines` de `node_modules/next/package.json`, visible tras `npm install`) y npm.

1. Instala las dependencias:
   ```
   npm install
   ```
2. Copia `.env.example` a `.env.local` y rellena las dos variables con los datos de tu proyecto de Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

   No uses nunca la secret key. `.env.local` no se sube al repositorio.
3. Si quieres reproducir la base de datos, crea tu propio proyecto en Supabase y ejecuta
   [docs/supabase-schema.sql](docs/supabase-schema.sql) en su editor SQL.
4. Arranca la app en modo desarrollo:
   ```
   npm run dev
   ```
5. Comprobaciones:
   ```
   npm run lint
   npm run build
   ```

## 9. Limitaciones conocidas

- **Sin confirmación por correo:** está desactivada en Supabase para que la demo sea más cómoda (configuración del usuario).
- **Supabase puede pausarse:** el proyecto gratuito de Supabase puede pausarse por inactividad.
  Si pasa, hay que reactivarlo desde su panel.
- **Funciones que no hay:** no se pueden editar movimientos, y no hay filtros ni gráficos.
- **Lista limitada:** la lista muestra los últimos 100 movimientos. Si hay más, lo avisa.
- **Lectura por bloques:** las peticiones por bloques no forman una transacción. Si entre dos bloques se borra un movimiento
  y se crea otro, el número de movimientos no cambia, el código no lo detecta y la cifra podría mezclar los dos estados.
  Solo puede pasar con más de 1000 movimientos, y la siguiente carga lo corrige.
  Detalle en "Limitación conocida (B)" de [docs/evidencias/T-005-ronda-1.md](docs/evidencias/T-005-ronda-1.md).
- **Sin tests automáticos:** la mejora prevista es añadir pruebas de extremo a extremo con Playwright.

## 10. Cuenta de demostración

El usuario y la contraseña de la cuenta demo se facilitan en el formulario de entrega del reto. No se escriben en este README.
