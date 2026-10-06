# Estado — Paku Web

> Actualizado: 2026-10-05 · adaptado al backend de octubre (C-01 a C-19). Commits `8f88eb3` a `56e1521`,
> sin push.

## Qué funciona (según código; verificado con Playwright contra el API simulado)

- Login, registro, forgot/reset password.
- **Compra** (`/booking`): mascota (peso obligatorio) → servicio con precios del backend y total de
  `/store/quote` → **reserva del día** (`POST /holds`, se reusa si ya existe) → dirección → carrito con
  `meta.hold_id` y sin precios → checkout (maneja `PRICE_CHANGED`) → orden → pago Culqi
  (`POST /orders/{id}/pay`). Si la reserva vence, vuelve a la fecha con aviso.
- **Mis pedidos**: estados incluido `skipped` (cualquier estado nuevo tiene texto por defecto), hora
  asignada por el admin o "hora por confirmar", pagar o **reintentar el pago** tras un rechazo
  (`retry-payment` → `pay`).
- **Seguimiento** (spec 0001): pasos del servicio, adicionales realizados, fotos, demoras, motivo del
  salto; mapa con `groomer_location`, chat y transmisión en vivo.
- **Notificaciones** (spec 0002): campana con contador en el header.
- Mascotas, direcciones, tarjetas guardadas, perfil.
- Web informativa: blog, contacto, políticas, libro de reclamaciones, soporte, Paku Spa.

## Pendiente para dar por cerrada la adaptación

- [ ] **Desplegar C-19 en el backend.** Hasta entonces `POST /holds` guarda la reserva pero responde 500 y
  la compra no funciona contra el servidor. Comprobar: en `/openapi.json`, `HoldOut.date` debe ser
  `string`, no `null`.
- [ ] **Prueba real de punta a punta** con credenciales de prueba (cliente con perfil completo, mascota con
  peso, día con cupo, tarjeta de prueba Culqi): compra completa, reserva vencida, cambio de precio,
  reintento de pago, seguimiento y campana. Todo lo anterior se verificó solo contra el API simulado con
  los contratos de `paku-backend`.
- [ ] Al terminar la prueba real, archivar `specs/arranque-backend-2026-10.md`.

## Decisiones tomadas (2026-10-05)

- La reserva se crea al confirmar la fecha ("Reservar fecha"), no en el paso de revisión.
- `meta.scheduled_time` se envía fijo ("09:00") porque el backend lo exige, pero no se muestra: la hora la
  asigna el admin (`scheduled_at`).
- El carrito del header es solo lectura; el pedido se arma y se cambia en el asistente.
- Con la orden ya creada no se puede volver atrás desde "Revisar".
- El cliente ve todas las fotos, incluidas las de incidente (owner).
- Notificaciones solo dentro de la web; push web necesitaría trabajo en el backend (owner).
- La reprogramación de una visita no realizada se coordina por interno; la web solo informa.

## Pedidos al backend

- [x] **500 en las respuestas de reservas** (`HoldOut.date` tipado como `null`). Reportado 2026-10-05;
  corregido en paku-backend `fd48bb5` (**C-19**). Pendiente de despliegue (ver arriba).
- [ ] *(ya pedido por paku-admin)* Endpoint para marcar todas las notificaciones como leídas; hoy se marcan
  de a una.

## Pendientes heredados

- [ ] `home-v2` vs `page.tsx` actual (`HeroSectionV2` es la home en uso).
- [ ] `.env` no define `NEXT_PUBLIC_CULQI_PUBLIC_KEY` ni `NEXT_PUBLIC_PAYMENT_API_URL/KEY`: sin la clave
  pública de Culqi no se puede tokenizar una tarjeta nueva (las guardadas sí funcionan).
- [ ] Credenciales de producción de Culqi.

## Observaciones

- Toda la API de paku-backend pasa por `lib/api/client.ts` (refresh de token y errores en español con
  `lib/api/errors.ts`). Textos de valores de la API en `lib/labels.ts`. Fechas de negocio en hora de Lima
  (`lib/utils/dates.ts`).
- Pagos: solo Culqi. Tokenización en cliente (`secure.culqi.com`); tarjetas guardadas vía culqi-python
  (`NEXT_PUBLIC_PAYMENT_API_URL`) y `/wallet/cards`; el cobro lo hace paku-backend con
  `POST /orders/{id}/pay`.
- `pnpm lint`: 0 problemas. `pnpm build`: OK.
