---
feature: 0002-campana-notificaciones
spec: ./spec.md
---

# Plan — Campana de notificaciones

## Enfoque

Igual que la campana de paku-admin (feature 0004 de ese repo): solo el contador se consulta cada
2 minutos y únicamente con la pestaña visible; la lista se pide al abrir la campana. Cada aviso con
`data.order_id` lleva a `/mis-pedidos/{id}`. Va en el header, junto al carrito en escritorio y junto a
la hamburguesa en móvil, solo con sesión.

Descartado: consultar la lista completa periódicamente (más carga sin necesidad) y push web (el
backend solo envía push por Expo).

## Cambios por repo

### paku-web
- `types/notifications.ts`: `NotificationOut`, `UnreadCountOut`.
- `lib/api/notifications.ts` + `ENDPOINTS.NOTIFICATIONS`: contador, lista, marcar leída, marcar todas
  (de a una), destino de un aviso.
- `components/common/NotificationBell.tsx`: campana con DropdownMenu de shadcn.
- `components/layout/Header.tsx`: campana en escritorio y móvil.

## Contrato

Ya existe (OpenAPI desplegado, 2026-10-05):

- `GET /notifications?unread_only=&limit=20` → `[{ id, user_id, type, title, body, data, is_read, created_at }]`
- `GET /notifications/unread-count` → `{ unread_count }`
- `POST /notifications/{id}/read`

## Migraciones de datos

Ninguna.

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Carga en el servidor por muchas pestañas abiertas | Solo el contador, cada 2 min y con la pestaña visible |
| Marcar todas de a una con muchos avisos | Solo los no leídos de la lista abierta (máx. 20) |

## Rompe clientes

- [ ] paku-web — impacto: ninguno.
- [ ] paku-admin — no aplica.
- [ ] paku-vet-dev — no aplica.

## Tests

Playwright contra el API simulado: contador, lista, tocar un aviso (marca leído y navega), marcar
todo, pestaña oculta sin consultas. Más `pnpm build` y `pnpm lint`.
