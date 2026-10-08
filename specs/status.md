# Estado — Paku Web

> Actualizado: 2026-10-05 · adaptado al backend de octubre (C-01 a C-21; C-20/C-21 aún sin desplegar). Commits `8f88eb3` a `480150b`,
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

- [x] **C-19 desplegado** (comprobado en `/openapi.json` el 2026-10-05: `HoldOut.date` es `date`).
- [ ] **Cuando se despliegue C-21:** dejar de enviar `meta.scheduled_time` (ya es opcional) en
  `components/booking/StepReviewCart.tsx` (`SCHEDULED_TIME`). Hoy el servidor desplegado aún lo exige.
- [ ] **Prueba real de punta a punta** con credenciales de prueba (cliente con perfil completo, mascota con
  peso, día con cupo, tarjeta de prueba Culqi): compra completa, reserva vencida, cambio de precio,
  reintento de pago, seguimiento y campana. Todo lo anterior se verificó solo contra el API simulado con
  los contratos de `paku-backend`.
- [ ] Al terminar la prueba real, archivar `specs/arranque-backend-2026-10.md`.

## Decisiones tomadas (2026-10-05)

- Día del servicio mostrado: `scheduled_at` si el admin ya lo asignó; si no, `reserved_date` (C-21) o,
  si el backend aún no lo envía, `meta.scheduled_date` del servicio base.
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
  corregido en paku-backend `fd48bb5` (**C-19**) y desplegado.
- [ ] *(ya pedido por paku-admin)* Endpoint para marcar todas las notificaciones como leídas; hoy se marcan
  de a una.

## Sección "Mi cuenta" unificada (2026-10-08)

- "Mis pedidos" pasó de `/mis-pedidos` a `/account/orders` (y `/account/orders/[id]`), dentro del layout de
  cuenta. `/mis-pedidos` y `/mis-pedidos/:id` redirigen (301) desde `next.config.ts`.
- Componentes comunes en `components/account/`: `AccountPageHeader` (título de página), `EmptyState`,
  `InlineAlert` (error/éxito con "Reintentar").
- `components/ui` (shadcn) nuevos: `Badge` (etiquetas y chips de estado), `NativeSelect` (select nativo con
  aspecto de `Input`; se usa porque los campos de mascota necesitan la opción vacía "Sin especificar"),
  `Textarea`. `Label` ahora es atenuado por defecto y es la única etiqueta de formulario.
- Botones: solo `Button` con variantes estándar; se quitaron las variantes propias `edit` y `delete`.
  `CardDataForm` (también usado en el checkout de `/booking`) pasó a `Input`/`NativeSelect`/`Button`.
- Header: "Pagos" apuntaba a `/account/orders`; ahora a `/account/payments`. Menú móvil con "Mis pedidos".
- Verificado: eslint y `tsc` sin errores; `next build` OK con variables de Firebase de relleno (sin `.env`
  el build falla en el prerender, también sin estos cambios). **Falta revisión visual con sesión real**
  (cuenta y checkout de `/booking`).
- Fuera de alcance: los botones del reproductor de transmisión (sobre fondo oscuro) y el resto de la web.

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
