---
feature: 0001-seguimiento-servicio
plan: ./plan.md
---

# Tasks — Seguimiento del servicio

Orden de ejecución. Cada tarea es verificable.

## Frontend
- [x] Tipos `OrderPhotoOut` y `DelayReportOut`; `ordersService.photos` y `delayReports`.
- [x] Textos en `lib/labels.ts`: pasos, motivos de salto, tipos de foto.
- [x] `useOrderExtras(orderId, clave)`: fotos y demoras, sin romper si fallan.
- [x] `ServiceSteps`: cinco pasos, actual destacado, hora de inicio; oculto sin log.
- [x] Adicionales realizados en el resumen del servicio.
- [x] `OrderPhotos`: grilla con tipo, nota y hora; vista ampliada.
- [x] `DelayNotice`: último aviso mientras la orden no llega.
- [x] Motivo, nota y hora en el aviso de visita no realizada.
- [x] Verificación Playwright (en servicio, en camino con demora, saltada) + build + lint.

## Cierre
- [x] Spec a estado `done`
- [x] Índice de `specs/README.md` actualizado
