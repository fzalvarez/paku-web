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

## Observaciones

- Pagos: solo Culqi. Tokenización en cliente; el cobro va a un microservicio (`stream.dev-qa.site/payment/*`).
  Ver `referencias/frontend-api.md` y `MIGRACION_CULQI.md`.
