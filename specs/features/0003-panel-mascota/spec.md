---
feature: 0003-panel-mascota
estado: in-progress   # draft | approved | in-progress | done | abandoned
repos: [paku-web]
creado: 2026-10-08
---

# Panel de la mascota

## Problema

La ficha de cada mascota es un formulario: el dueño carga datos (edad, peso, pelo, antiparasitario…) pero
no recibe nada a cambio. Por eso el perfil de grooming suele quedar incompleto, y Paku no aprovecha esos
datos para recordarle al cliente cuándo le toca el próximo baño.

## Objetivo

Con los datos que ya existen, el dueño ve un panel de su mascota que le dice en qué etapa está, cómo va su
peso, cuándo le toca el próximo baño y qué cuidados preventivos tiene pendientes, con acceso directo a
reservar.

## Fuera de alcance

- **Reemplazar la ficha o el formulario actuales:** el panel es una sección adicional (decidido por el
  owner, 2026-10-08). Los datos se siguen editando en la ficha.
- Mover estas reglas al backend: por decisión del owner (2026-10-08) quedan en el frontend, en un módulo
  propio (`lib/pet-insights/`), separado de la UI.
- IA, diagnósticos o consejos médicos; cálculo de calorías, marcas o cantidades de alimento.
- Registrar desde el panel vacunas o antiparasitarios.

## Comportamiento esperado

1. **Dado** un cliente con sesión, **cuando** abre una mascota desde su tarjeta o su ficha ("Ver panel"),
   **entonces** ve `/account/pets/{id}/panel`.
2. **Edad y etapa:** con fecha de nacimiento, muestra la edad (años y meses), la etapa (cachorro, adulto,
   senior) y la edad humana aproximada. Sin fecha, invita a completarla.
3. **Peso:** muestra el último peso y su evolución en un gráfico, con tooltip y vista de tabla. Con un solo
   registro muestra solo el valor; sin registros, invita a registrar el peso.
4. **Próximo baño:** con el último baño (pedido `done` de Paku para esa mascota o registro `bath`/`grooming`)
   y el tipo de pelo, estima cuándo le toca y ofrece **Reservar su baño**, que abre el asistente con la
   mascota preseleccionada. Si ya pasó la fecha, dice "Le toca su baño". Sin historial, invita a reservar.
5. **Salud preventiva:** vacunas al día, antiparasitario (con próxima dosis estimada si hay un registro
   `deworming` y un intervalo), esterilización y revisión dental (perros desde los 3 años). Cada punto
   dice su estado con ícono y texto, no solo color.
6. **Su historia en Paku:** últimos servicios de esa mascota con fecha y enlace al pedido.
7. **Lecturas para {nombre}:** hasta 3 artículos del blog elegidos por especie, etapa y cuidados.
8. **Datos por raza** (cruce con el catálogo de razas del backend por `breed_id`): esperanza de vida en la
   cabecera; peso actual frente al rango habitual de su raza (no en cachorros ni mestizos); energía típica de
   la raza junto a la que indicó el dueño, con actividad diaria sugerida; tipo de alimento orientativo según
   especie, etapa y tamaño (sin marcas ni cantidades). El manto de la raza (`coat_type` del catálogo) se usa
   para el próximo baño si el dueño no indicó el tipo de pelo.
9. **Completa su perfil:** lista los datos que faltan y qué desbloquea cada uno, con enlace a la ficha.
10. Si algo no carga (registros o pedidos), el resto del panel se muestra igual.

## Reglas de cálculo (propuesta, pendiente de confirmar con el owner)

Orientativas; el panel lo dice ("estimado", "aproximado").

- **Tamaño:** el campo `size`; si falta, el de su raza; si tampoco, por peso: < 10 kg pequeño, 10–25 kg
  mediano, > 25 kg grande.
- **Etapa — perros:** cachorro < 1 año; senior desde 10 años (pequeño), 8 (mediano), 7 (grande).
  **Gatos:** cachorro < 1 año; senior desde 11.
- **Edad humana:** 1.er año = 15, 2.º = 24; luego +4 por año (pequeño y gatos), +5 (mediano), +6 (grande).
- **Intervalo de baño por pelo (dueño):** corto 7 semanas, medio 5, largo 4. **Por manto de la raza:**
  simple corto 7; simple medio/largo, rizado y mixto rizado 4; doble manto 6. Sin dato: 5 semanas
  (coherente con el artículo "¿Cada cuánto bañar a tu perro?").
- **Actividad diaria (perros):** energía baja 30–60 min, media 60–90, alta 90–120.
- **Datos por raza:** peso adulto, energía y esperanza de vida aproximados de los estándares AKC/FCI para
  las 85 razas del catálogo (los mestizos no tienen datos).
- **Antiparasitario:** mensual = 30 días, trimestral = 90 días desde el último registro `deworming`.
- **Revisión dental:** perros de 3 años o más.

## Criterios de aceptación

- [ ] Acceso al panel desde la tarjeta de la mascota y desde su ficha, sin quitar nada de lo existente.
- [ ] Edad, etapa y edad humana; peso con gráfico accesible (tooltip, tabla).
- [ ] Próximo baño con botón que abre `/booking?pet={id}` con la mascota preseleccionada, respetando
      todas las reglas del asistente.
- [ ] Salud preventiva, historia en Paku, lecturas y "completa su perfil".
- [ ] Datos por raza: esperanza de vida, peso frente a su raza, energía y actividad, alimentación orientativa.
- [ ] Cada bloque tolera datos faltantes y errores de carga.
- [ ] eslint, `tsc` y `next build` sin errores.

## Impacto en el dominio

Ninguno. Lee `GET /pets/{id}`, `GET /pets/{id}/records`, `GET /orders` y `GET /catalog/breeds`, que ya
existen. El asistente de
reserva acepta `?pet=` (solo preselección en el primer paso).

## Preguntas abiertas

- [ ] Confirmar las reglas de cálculo de arriba y los datos por raza (owner; idealmente con un veterinario).
- [ ] ¿El recordatorio del próximo baño debe llegar también como notificación? (requiere backend).
