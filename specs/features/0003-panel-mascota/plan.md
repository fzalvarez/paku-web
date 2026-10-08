---
feature: 0003-panel-mascota
spec: ./spec.md
---

# Plan — Panel de la mascota

## Enfoque

Todo en el cliente con datos existentes (decisión del owner: en el frontend, pero ordenado y separado de
la UI). Las reglas viven en un módulo de funciones puras, `lib/pet-insights/`, un archivo por tema; los
umbrales a confirmar están todos en `rules.ts` y los datos por raza en `breeds.ts`, con las claves del
catálogo del backend. La página nueva carga en paralelo la mascota, sus registros y los
pedidos; cada bloque recibe solo lo que necesita y tiene su estado vacío.

Descartado: reemplazar la ficha (fuera de alcance por decisión del owner) y calcular en el backend
(decisión del owner, 2026-10-08). Si algún día se mueve, `lib/pet-insights/` es la pieza a portar.

## Cambios por repo

### paku-web
- `lib/pet-insights/`: `rules.ts` (umbrales), `breeds.ts` (85 razas), `dates.ts`, `age.ts`, `weight.ts`,
  `bath.ts`, `health.ts`, `activity.ts`, `nutrition.ts`, `readings.ts`, `profile.ts`, `index.ts`.
- `types/pets.ts`: `Breed` con `coat_group`/`coat_type` (ya los devuelve `GET /catalog/breeds`).
- `app/account/pets/[id]/panel/page.tsx`: carga datos y reparte; sin lógica de negocio.
- `components/pets/panel/`: un componente por bloque (`PanelHeader`, `BathCard`, `WeightCard` +
  `WeightChart`, `ActivityCard`, `NutritionCard`, `HealthCard`, `HistoryCard`, `ProfileCompletion`,
  `Readings`) y `PanelCard` común.
- `app/account/pets/page.tsx` (tarjeta) y `app/account/pets/[id]/page.tsx` (ficha): enlace "Ver panel".
- `components/booking/BookingWizard.tsx`: `?pet=<id>` preselecciona la mascota en un inicio limpio
  (mismo criterio que `?service=`); el usuario sigue en el paso 1 y pasa por todas las validaciones.

## Contrato

Existente: `GET /catalog/breeds?species=` (`coat_type`), `GET /pets/{id}`, `GET /pets/{id}/records?limit=…` (`weight_record`, `deworming`, `vaccine`,
`bath`, `grooming`), `GET /orders` (`items_snapshot[].meta.pet_id`, `status`, `scheduled_at`,
`reserved_date`).

## Migraciones de datos

Ninguna.

## Riesgos

- Reglas orientativas tomadas como médicas → textos "estimado/aproximado" y aviso de consultar al
  veterinario; reglas a confirmar (spec).
- Muchos registros → se piden con límite; el gráfico usa solo `weight_record`.
- Datos por raza duplicados respecto del backend (las claves): si el backend agrega o renombra una raza,
  el panel simplemente no muestra datos de raza para ella.
