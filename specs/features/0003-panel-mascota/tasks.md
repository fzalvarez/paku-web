---
feature: 0003-panel-mascota
plan: ./plan.md
---

# Tasks — Panel de la mascota

## Frontend
- [x] Módulo `lib/pet-insights/` (un archivo por tema; umbrales en `rules.ts`).
- [x] Datos por raza en `breeds.ts` para las 85 razas del catálogo (verificado contra `breeds_data.py`).
- [x] Página `/account/pets/[id]/panel` con carga en paralelo y tolerancia a errores.
- [x] Bloques de raza: esperanza de vida, peso frente a su raza, energía y actividad, alimentación.
- [x] Bloques: cabecera (edad/etapa/edad humana), peso + `WeightChart`, próximo baño, salud preventiva,
      historia en Paku, lecturas, completa su perfil.
- [x] Enlaces "Ver panel" en tarjeta y ficha (sin quitar nada).
- [x] `BookingWizard`: preselección con `?pet=`.
- [x] eslint + `tsc` + `next build`.

- [x] Pruebas de las reglas (script con aserciones: edad, etapa, edad humana, tamaño por raza/peso,
      fechas en Lima, baño por pelo y por manto, antiparasitario, dental, peso frente a raza, energía,
      alimentación, lecturas).
- [ ] Revisión visual con sesión real (pendiente: sin navegador headless en este equipo).

## Cierre
- [ ] Spec a estado `done` cuando el owner confirme las reglas
- [ ] Índice de `specs/README.md` actualizado
