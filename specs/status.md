# Estado — Paku Web

> Actualizado: 2026-08-29 · **borrador, confirmar con owner**

## Qué funciona (según código / git)

- Login, forgot/reset password
- Carrito + checkout + flujo de pago con **Culqi** (migración desde Mercado Pago completada — `MIGRACION_CULQI.md`; credenciales de desarrollo)
- Mis pedidos
- Tracking en vivo con mapa (Leaflet)
- Panel de chat para órdenes activas (`on_the_way | in_service`)
- Perfil de mascota
- Web informativa: blog, contacto, políticas, libro de reclamaciones, soporte, Paku Spa
- `home-v2` (rediseño home, ¿en progreso?)

## En progreso / dudas

- [ ] `home-v2` vs `page.tsx` actual
- [ ] `paku-web.rar` en el repo — ¿limpiar?
- [ ] Pagos apuntan a `stream.dev-qa.site` (dev). Pendiente: credenciales de producción.

## Próximo

- [ ] (pendiente de priorización)

## Pedidos al backend

- [x] **500 en las respuestas de reservas** (`HoldOut.date` tipado como `null`). Reportado 2026-10-05;
  corregido en paku-backend `fd48bb5` (**C-19**). **Pendiente de despliegue:** hasta entonces `POST /holds`
  guarda la reserva pero responde 500, y el flujo de compra nuevo no se puede probar contra el servidor.
  Para comprobar el despliegue: `HoldOut.date` en `/openapi.json` debe decir `string`/`date`, no `null`.

## Observaciones

- Pagos: solo Culqi. Tokenización en cliente; el cobro va a un microservicio (`stream.dev-qa.site/payment/*`).
  Ver `referencias/frontend-api.md` y `MIGRACION_CULQI.md`.
