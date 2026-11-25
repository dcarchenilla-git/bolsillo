# Incidente en producción (Vercel): variables de entorno ausentes

Relato aportado por el usuario (copiado tal cual):

"Tras subir T-003, la web pública devolvió 'Internal Server Error'. Los registros de ejecución de Vercel mostraban el error 'Your project's URL and Key are required to create a Supabase client!' en la ruta /. Causa: las dos variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no estaban definidas en Vercel (la lista de Environment Variables estaba vacía); .env.local solo existía en el ordenador local y git lo ignora. Solución: se añadieron las dos variables como tipo Config en Production y se volvió a desplegar. Después la web funcionó. Lección: el build y la revisión de código no pueden detectar variables ausentes en el entorno de producción."
