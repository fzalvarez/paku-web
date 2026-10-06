---
feature: 0001-seguimiento-servicio
spec: ./spec.md
---

# Plan — Seguimiento del servicio

## Enfoque

Todo ocurre en el detalle del pedido (`app/mis-pedidos/[id]`), que ya consulta la orden cada 15 s
mientras está activa. Los campos nuevos de la orden se muestran directo; fotos y demoras se piden
aparte con un hook que se vuelve a ejecutar solo cuando cambian `status` o `service_step`. Así no se
regeneran las URLs firmadas de las fotos en cada consulta. Los componentes nuevos van en
`components/orders/` para no seguir agrandando la página (≈870 líneas).

Descartado: consultar fotos y demoras en cada vuelta de 15 s (vuelve a bajar las imágenes y suma
llamadas sin necesidad).

## Cambios por repo

### paku-web
- `types/orders.ts`: `OrderPhotoOut`, `DelayReportOut`.
- `lib/api/orders.ts`: `photos(id)`, `delayReports(id)`; `lib/api/endpoints.ts`: rutas.
- `lib/labels.ts`: textos de pasos, motivos de salto y tipos de foto.
- `hooks/useOrderExtras.ts`: fotos y demoras de una orden; recarga con una clave (`status|step`).
- `components/orders/ServiceSteps.tsx`: pasos con el actual y sus horas.
- `components/orders/OrderPhotos.tsx`: grilla de fotos con vista ampliada (Dialog de shadcn).
- `components/orders/DelayNotice.tsx`: último aviso de demora.
- `app/mis-pedidos/[id]/page.tsx`: integra lo anterior, adicionales realizados y detalle del salto.

## Contrato

Ya existe (OpenAPI desplegado, 2026-10-05):

- `GET /orders/{id}/photos` → `[{ id, kind: "initial"|"final"|"incident", read_url, note, created_at }]`
- `GET /orders/{id}/delay-reports` → `[{ id, order_id, groomer_id, delay_minutes, note, created_at }]`
- `OrderOut.service_steps_log: [{ step, started_at }]`, `addons_done: [{ addon_id, done_at }]`,
  `skip_reason`, `skip_note`, `skipped_at`.

## Migraciones de datos

Ninguna.

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| La URL firmada de una foto vence con la página abierta mucho tiempo | Se recargan al cambiar estado o paso. Si una imagen falla, se muestra su tipo y hora sin romper la sección |
| Órdenes viejas sin pasos | No se muestra el bloque de pasos |
| `addons_done` usa el id del adicional | Se cruza con `ref_id` de los ítems `service_addon` del snapshot |

## Rompe clientes

- [ ] paku-web — impacto: ninguno, solo agrega información.
- [ ] paku-admin — no aplica.
- [ ] paku-vet-dev — no aplica.

## Tests

El repo no tiene tests automáticos. Verificación con Playwright contra el API simulado (contratos del
OpenAPI): orden en servicio con pasos, adicionales hechos y fotos; orden en camino con demora; orden
saltada. Más `pnpm build` y `pnpm lint`.
