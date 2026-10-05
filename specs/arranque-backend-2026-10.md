# Arranque: adaptar paku-web al backend de octubre 2026

> Creado: 2026-10-05. Punto de partida para la sesión que adapte paku-web. Borrar o archivar cuando el
> trabajo termine (el estado vivo va en `status.md`).

paku-web (web de clientes: reservar, pagar, seguir el servicio) se construyó contra el backend
anterior. paku-backend cambió entre el 2026-10-03 y el 2026-10-05 (C-01 a C-18, desplegado hasta
`0637388`). La web admin ya se adaptó (`paku-admin/specs/status.md`).

## Fuentes de verdad (leer, no copiar aquí)

- `paku-backend/specs/workspace.md` y `constitution.md`.
- `paku-backend/docs/guia-front-cambios-octubre-2026.md`: sección **"2. App de clientes"** y checklist
  "Clientes". Es el resumen.
- `paku-backend/docs/cambios-api-para-front.md`: detalle de C-01 a C-18 (qué rompe y qué apps afecta).
- `paku-backend/docs/consultas-para-front.md`: preguntas del backend y respuestas ya aplicadas.
- OpenAPI desplegado: `https://api.paku.com.pe/paku/api/v1/openapi.json` (forma real de los contratos).
- Next 16: `node_modules/next/dist/docs/` (`middleware` → `proxy`; `useSearchParams` necesita
  `<Suspense>` o falla el build).

## Lo que más probablemente rompe a paku-web

Lista para orientar el diagnóstico; confirmarla contra las fuentes.

| Tema | C-xx |
|---|---|
| "ally" → "groomer" (`groomer_id`, `groomer_location`, `sender_role`, `recorded_by_role`) | C-09 |
| Estado `skipped` (no asumir lista cerrada de estados) | C-13 |
| Token obligatorio en `GET /pets/{id}` y en el catálogo con `?pet_id=` | C-04, C-05 |
| Carrito: precios del backend, addons como líneas `service_addon` sin `meta`, `PRICE_CHANGED` en checkout | C-07 |
| Reserva obligatoria antes del carrito (`POST /holds` → `meta.hold_id`), `HOLD_EXPIRED` | C-15 |
| El cliente ya no cambia estados (`PATCH /orders/{id}` eliminado) | C-02, C-16 |
| Nuevo para mostrar: pasos, fotos, demoras, motivo de salto, notificaciones | C-11 a C-14 |

## Pistas en el código (no exhaustivas)

Archivos que mencionan contratos viejos: `lib/api/{endpoints,booking,store,streaming}.ts`,
`hooks/useTracking.ts`, `components/booking/{StepReviewCart,StepOrderConfirmed}.tsx`,
`components/common/CartButton.tsx`, `app/mis-pedidos/page.tsx`, `app/mis-pedidos/[id]/page.tsx`.

Pendientes viejos (`status.md`, 2026-08-29): `home-v2` contra la home actual, `paku-web.rar` en el
repo, pagos contra `stream.dev-qa.site` sin credenciales de producción, variables de pago posiblemente
faltantes en `.env`.

## Forma de trabajo

1. **Diagnóstico (solo lectura):** flujo de cliente (registro/login, mascotas, catálogo y precios,
   reserva y carrito, checkout y pago, mis pedidos y seguimiento, tracking, chat, notificaciones) →
   C-xx que lo afectan → archivos → roto / falta. Línea base de `pnpm lint` y `pnpm build`.
2. **Plan:** fases en orden con prioridad y riesgo, empezando por lo roto, más las dudas de flujo
   para el owner. **Esperar aprobación.**
3. **Implementación por fases:** las features nuevas pasan por spec → plan → tasks en
   `specs/features/NNNN-slug/`. Los arreglos de compatibilidad y los refactors no llevan spec. Un commit
   por fase, sin push (lo hace el owner).

## Lecciones de la adaptación del admin

- **Versión desplegada del backend:** que el servidor tenga el commit no basta, porque puede faltar
  reiniciar el contenedor. Hay que mirar las descripciones de `/openapi.json`, que salen del código en
  ejecución.
- **Credenciales:** las cuentas de prueba se borraron el 2026-10-05; pedirle al owner credenciales
  nuevas (cliente, y groomer si hace falta). No guardarlas en archivos ni en memoria.
- **Escrituras reales** (reservar, pagar, cancelar): confirmar con el owner y usar datos de prueba.
- **Playwright** con Chromium está en `Odyssoft/dulce-recuerdo-whatsapp-playwright/node_modules/playwright`.
- **Saltos de línea:** el repo usa `core.autocrlf=true` y en disco hay archivos CRLF; en sustituciones
  con perl o sed, aceptar `\r?\n`.
- **Errores:** un solo parser que lea `detail.code` y `detail.message` y traduzca al español (modelo:
  `paku-admin/lib/apiHelpers.ts`).
- **Interfaz en español;** los textos de los valores de la API van en un solo módulo (modelo:
  `paku-admin/lib/labels.ts`).
- **"El backend calcula, el front muestra":** ningún precio se calcula ni se envía desde el front.
- **No tocar ni commitear cambios ajenos**, por ejemplo `components/sections/home/HeroSectionV2.tsx`,
  que estaba modificado sin commitear al crear este archivo.
