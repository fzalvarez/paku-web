---
feature: 0002-campana-notificaciones
estado: done          # draft | approved | in-progress | done | abandoned
repos: [paku-web]
creado: 2026-10-05
---

# Campana de notificaciones

## Problema

El backend le avisa al cliente cada novedad de su pedido: asignación con hora, "Tu groomer llegó", cada
paso del servicio, adicionales realizados, demoras, visita no realizada, pago confirmado y mensajes
del chat (C-11 a C-14, C-17). La app móvil los recibe como push, pero la web no muestra ninguno. Quien
compra desde la web no se entera si no abre el detalle del pedido.

## Objetivo

Con la sesión iniciada, el cliente ve cuántas novedades tiene sin leer y llega en un clic al pedido.

## Fuera de alcance

- Notificaciones del navegador (push web): el backend envía push con Expo, que solo sirve para la app
  móvil. Para la web haría falta trabajo en el backend (decidido con el owner, 2026-10-05).
- Sonidos y configurar qué avisos recibir.
- Avisos nuevos en el backend: se muestran los que ya existen.

## Comportamiento esperado

1. **Dado** un cliente con sesión, **entonces** en la barra superior (escritorio y móvil) hay una
   campana con el número de avisos sin leer (nada si son 0; "9+" si son más de 9).
2. **Consulta liviana:** el número se actualiza cada 2 minutos **solo con la pestaña visible**, y al
   volver a la pestaña. Con la pestaña oculta no se consulta.
3. **Dado** que el cliente abre la campana, **entonces** ve los últimos 20 avisos (más nuevos arriba)
   con título, texto y hace cuánto llegaron; los no leídos se distinguen.
4. **Dado** un aviso de un pedido (trae `data.order_id`), **cuando** el cliente lo toca, **entonces** se
   marca como leído y se abre el detalle de ese pedido.
5. **Dado** avisos sin leer, **cuando** elige **Marcar todo como leído**, **entonces** el contador queda
   en 0.
6. **Dado** que no hay avisos, **entonces** la lista dice "No tienes notificaciones".
7. **Dado** que la consulta falla, **entonces** la campana sigue sin número y se reintenta en la
   siguiente vuelta, sin mensajes molestos.
8. Sin sesión no hay campana.

## Criterios de aceptación

- [x] Campana con contador en escritorio y móvil, solo con sesión.
- [x] Sin consultas con la pestaña oculta; consulta al volver.
- [x] Lista de los últimos 20 con no leídos destacados.
- [x] Tocar un aviso lo marca leído y abre el pedido.
- [x] Marcar todo como leído.
- [x] `pnpm build` sin errores; lint sin errores nuevos.

## Impacto en el dominio

Ninguno. Usa `GET /notifications`, `GET /notifications/unread-count` y
`POST /notifications/{id}/read`, que ya existen.

## Preguntas abiertas

- [ ] El backend no tiene "marcar todas como leídas": se marcan de a una (igual que paku-admin, que ya
  lo dejó como pedido al backend).
