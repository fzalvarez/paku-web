---
feature: 0001-seguimiento-servicio
estado: done          # draft | approved | in-progress | done | abandoned
repos: [paku-web]
creado: 2026-10-05
---

# Seguimiento del servicio

## Problema

Desde octubre de 2026 el groomer registra el servicio paso a paso en la van (C-11), sube fotos (C-12),
avisa demoras (C-14) y puede saltar la parada (C-13). El backend ya le manda esa información a la
orden, pero el cliente en paku-web solo ve "Servicio en curso". No sabe en qué va su mascota, no ve las
fotos y, si la parada se saltó, no sabe por qué.

## Objetivo

En el detalle de su pedido, el cliente ve en qué paso va el servicio, qué adicionales ya se hicieron,
las fotos, los avisos de demora y, si no se pudo hacer la visita, el motivo.

## Fuera de alcance

- Notificaciones (campana) y push: feature 0002.
- Cambios en el mapa o la transmisión en vivo.
- Calificar el servicio, reclamos o reprogramar desde la web (la reprogramación se coordina por
  interno).
- Cambios en el backend: todo usa endpoints que ya existen.

## Comportamiento esperado

1. **Dado** una orden en servicio con `service_step`, **cuando** el cliente abre el detalle,
   **entonces** ve los cinco pasos (Recepción y recojo → Baño → Secado → Corte y acabado → Devolución
   a casa), cuál es el actual y la hora en que empezó cada paso ya iniciado.
2. **Dado** una orden terminada que registró pasos, **entonces** los pasos se ven todos completos con
   su hora. **Dado** una orden sin pasos registrados (anterior a C-11), **entonces** no se muestra el
   bloque de pasos.
3. **Dado** un adicional marcado como hecho (`addons_done`), **entonces** en el resumen del servicio
   ese adicional dice "Realizado" con la hora.
4. **Dado** que la orden tiene fotos, **entonces** hay una sección "Fotos del servicio" con todas
   (inicio, final e incidente, cada una con su tipo, nota y hora). Al tocar una se ve en grande. Sin
   fotos, la sección no aparece.
5. **Dado** un aviso de demora en una orden que todavía no llega (creada, aceptada o en camino),
   **entonces** se ve "Tu especialista llegará ~X min más tarde" con la nota, si la hay, y la hora del
   aviso (el más reciente).
6. **Dado** una orden saltada, **entonces** el aviso de "Visita no realizada" dice el motivo, la nota
   del groomer si la hay y la hora.
7. **Dado** que fotos o demoras no se pueden cargar, **entonces** el resto del detalle se ve igual y
   esas secciones no aparecen.
8. Fotos y demoras se cargan al abrir el detalle y cuando cambia el estado o el paso de la orden (el
   detalle ya consulta la orden cada 15 s). No se recargan en cada consulta, para no volver a bajar
   las imágenes.

## Criterios de aceptación

- [x] Pasos con el actual destacado y la hora de inicio de cada uno.
- [x] Adicionales realizados marcados con su hora.
- [x] Fotos de los tres tipos, ampliables, solo si existen.
- [x] Último aviso de demora mientras la orden no llega.
- [x] Motivo, nota y hora del salto.
- [x] Un fallo al cargar fotos o demoras no rompe el detalle.
- [x] `pnpm build` sin errores; lint sin errores nuevos.

## Impacto en el dominio

Ninguno. Usa campos de `OrderOut` (`service_step`, `service_steps_log`, `addons_done`, `skip_*`) y
`GET /orders/{id}/photos`, `GET /orders/{id}/delay-reports`, que ya existen (C-11 a C-14).

## Preguntas abiertas

- [x] ¿El cliente ve las fotos de incidente? Sí, ve todas (owner, 2026-10-05).
