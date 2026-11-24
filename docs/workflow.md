# Flujo de trabajo

## Ciclo
1. Orchestrator asigna una tarea T-NNN a Develop.
2. Develop implementa y entrega.
3. Orchestrator pasa la entrega a Testing.
4. Testing informa. Rechazado → vuelta al paso 2 con el informe. Aprobado o Bloqueado → fin.
5. Orchestrator copia cada informe, literal, en docs/evidencias/T-NNN-ronda-N.md
   y resume al usuario.
Máximo 3 rondas; si se superan, se marca Bloqueado y decide el usuario.

## Asignación (Orchestrator → Develop)
T-NNN · Título / Objetivo / Criterios de aceptación / Archivos previstos / Fuera de alcance

## Entrega (Develop → Orchestrator)
T-NNN · Ronda N / Archivos cambiados / Qué se hizo / Resultado literal de lint y build / Dudas

## Informe (Testing → Orchestrator)
T-NNN · Ronda N / Revisado: commit <hash> o archivos y cambios /
Comprobaciones y resultado / Defectos (o "ninguno") / Veredicto

## Resumen final (Orchestrator → usuario)
T-NNN · Veredicto final · Nº de rondas / Qué cambió / Enlaces a evidencias
