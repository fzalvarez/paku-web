# Análisis Crítico: Integración paku-vet-dev vs paku-web

**Fecha:** 25 de junio de 2026  
**Objetivo:** Evaluar qué hace falta en paku-web respecto a los criterios de integración de paku-vet-dev

---

## 📊 Resumen Ejecutivo

### Estado Actual
- **paku-vet-dev**: App mobile nativa (React Native/Expo) — **REFERENCIA DE CALIDAD**
  - Arquitectura bien estructurada con criterios claros
  - Integración de pagos (Culqi) consolidada
  - Tracking en tiempo real completamente implementado
  - Flujos de carrito y órdenes claramente definidos

- **paku-web**: Next.js — **PARCIALMENTE IMPLEMENTADO**
  - Autenticación funcionando relativamente bien
  - Mascotas guardadas (aunque no vistas en esta búsqueda)
  - Pagos con Mercado Pago — pero **incompleto**
  - Carrito y órdenes — estructura base existe pero **mal integrada**
  - Tracking — existe pero **desacoplado de órdenes activas**

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **PAGOS Y TARJETAS (70% roto)**

#### En paku-vet-dev (BIEN):
```
✅ Culqi integrado como proveedor de pagos único
✅ Flujo claro: tokenizar → guardar tarjeta → cobrar
✅ usePaymentService con métodos: 
   - saveCard(culqiCustomerId, cardData)
   - charge(CreateChargePayload)
   - chargeSavedCard(params)
✅ Tipos definidos: SavedCard, CulqiToken, CulqiCharge
✅ Wallet persistente en backend (/wallet/cards)
✅ Seguridad: nunca envía datos de tarjeta — solo tokens
```

#### En paku-web (PROBLEMAS):
```
❌ Mercado Pago integrado pero:
   - SDK cargado dinámicamente en cada componente
   - Inicialización repetida en PaymentsPage.tsx y StepPayment.tsx
   - No hay servicio centralizado
   - usePayments hook mezcla lógica de tarjetas con polling de pagos

❌ Guardado de tarjetas:
   - saveCard(cardToken) existe pero:
     * No retorna id consistente
     * Falta el campo "mp_card_id" en SavedCard para reusarla
     * DELETE /api/payment-methods NO EXPONE ENDPOINT (comentario línea 429)
   
❌ Tipos inconsistentes:
   - SavedCard tiene "mp_card_id" pero NO se usa correctamente
   - PayWithNewCardPayload y PayWithSavedCardPayload separadas
   - Campos faltantes: exp_month, exp_year en respuesta

❌ Flujo de pago incompleto:
   - handlePayWithNewCard() crea token pero:
     * No maneja bien "save_card: true"
     * El polling no valida correctamente los intentos

❌ No hay soporte para:
   - Múltiples métodos de pago (Culqi, Yape, etc)
   - Validación de tarjetas antes de guardar
   - Reintentos de pago fallido
```

**ACCIÓN REQUERIDA:**
- Migrar de Mercado Pago a Culqi (como paku-vet-dev)
- Crear servicio centralizado: `paymentService` con métodos claros
- Validar que SavedCard tenga todos los campos necesarios

---

### 2. **CARRITO Y CHECKOUT (60% roto)**

#### En paku-vet-dev (BIEN):
```
✅ Flujo de carrito claro:
   1. createWithItems() — cart + items
   2. validate() — validar antes de checkout
   3. checkout() — marcar como checked_out
   4. createOrder() — crear orden con dirección

✅ Tipos bien definidos:
   - CartItemKind: "service_base" | "addon"
   - CartItemMeta con pet_id, scheduled_date, etc.
   - ValidateCartResponse con valid/errors/warnings
   - CheckoutResponse con total y currency

✅ Estados claros:
   - active → checked_out → order creada
   - Validación de meta completeness
```

#### En paku-web (PROBLEMAS):
```
❌ Carrito parcialmente implementado:
   - createWithItems() ✅
   - validate() ✅
   - checkout() ✅
   - Pero: NO HAY flujo integrado en la UI

❌ Falta integración en booking flow:
   - StepReviewCart.tsx existe pero:
     * No llama a cart.checkout() antes de procesar pago
     * buildingCart, validating, checkingOut son estados locales
     * No hay transición clara active → checked_out

❌ Tipos en paku-web/types/cart.ts:
   - CartItemKind solo tiene "service_base" | "service_addon" | "product"
   - FALTA: "addon" equivalente a paku-vet-dev
   - CartItemMeta NO tiene estructura clara (es dict[str, Any])
   - FALTA: validación de meta completeness

❌ Order creation desacoplada:
   - useCart() tiene checkout() pero:
     * NO transiciona a checked_out estado
     * createOrder() está separado en ordersService
     * Falta paso de CREATE_ORDER en flujo

❌ Cartbutton.tsx:
   - Muestra carrito pero NO maneja el flujo completo
   - El callback onCheckout no procesa validación
```

**ACCIÓN REQUERIDA:**
- Hacer que checkoutCart() transite estado a "checked_out"
- Integrar validación automática antes de checkout
- Crear flujo único: validate → checkout → createOrder
- Alinearen tipos CartItemKind con paku-vet-dev

---

### 3. **TRACKING Y MAPA (50% roto)**

#### En paku-vet-dev (BIEN):
```
✅ Tracking completamente integrado:
   - useAllyTracking hook con polling:
     * GET /current cada 10s (marcador)
     * GET /route cada 30s (polyline + ETA)
   - useLocationReporter (para ally) — reporta cada 10s
   
✅ Mapa con:
   - Marcador del ally (animado con PulsingPin)
   - Marcador del destino
   - Polyline decodificada de Google
   - ETA en banner

✅ Flujo de órdenes:
   - on_the_way → mostrar mapa + tracking
   - in_service → "Ya llegó"
   - done/cancelled → salir del mapa

✅ Estados manejados:
   - staleness_seconds > 30 → mostrar "Actualizando..."
   - ally_location === null → mostrar "Esperando..."
```

#### En paku-web (PROBLEMAS):
```
❌ Tracking existe pero DESACOPLADO de órdenes:
   - /mis-pedidos/[id]/page.tsx tiene TrackingPanel
   - Usa useTracking() con polling
   - PERO:
     * No sincroniza con estado de orden
     * Polyline decodificación manual (LeafletMap)
     * NO hay actualización automática del status

❌ useTracking() hook:
   - Maneja current + route polling ✅
   - PERO:
     * No maneja "isStale" banner (stale > 30s)
     * No tiene callback para cambios de estado
     * No detecta cuando ally llegó (transitaría a in_service)

❌ AllyMapLeaflet component:
   - Dibuja mapa con Leaflet (bien para web)
   - PERO:
     * No actualiza marcador en tiempo real
     * Polyline no se redibujan automáticamente
     * Sin animaciones de zoom

❌ Falta integración con órdenes:
   - OrderDetail no actualiza status en tiempo real
   - No hay polling de orden mientras está on_the_way
   - Sin transición automática on_the_way → in_service → done
```

**ACCIÓN REQUERIDA:**
- Implementar polling automático de estado de orden
- Sincronizar tracking con orden.status
- Agregar banners de stale (> 30s sin datos)
- Hacer que marcador del ally sea fluido (no saltos)

---

### 4. **ARQUITECTURA DE ESTADO (40% roto)**

#### En paku-vet-dev (BIEN):
```
✅ Zustand para estado global:
   - useAuthStore → user, tokens, isAuthenticated
   - useOrderStore → order actual
   - useThemeStore → tema claro/oscuro

✅ Servicios API centralizados:
   - authService → login, register, getCurrentUser
   - cartService → getActiveCart, createWithItems, checkout
   - paymentService → saveCard, charge, chargeNewCard
   - orderService → createOrder, confirmPayment, failPayment
   - trackingService → getCurrent, getRoute

✅ Hooks especializados:
   - useAuth() → usuario + acciones
   - useAllyTracking() → tracking en tiempo real
   - useLocationReporter() → reportar posición (ally)
```

#### En paku-web (PROBLEMAS):
```
❌ AuthContext en lugar de Zustand:
   - Funciona pero menos escalable que store
   - useAuthContext() existente
   - PERO: No hay equivalente para órdenes, carrito global

❌ Servicios dispersos:
   - authService ✅
   - cartService ✅
   - paymentsService (incorrectamente nombrado)
   - ordersService ✅
   - trackingService ✅
   - PROBLEMA: No hay coordinación entre servicios

❌ Hooks fragmentados:
   - useCart() ✅
   - usePayments() — MEGA hook que mezcla:
     * loadSavedCards
     * pay() con polling
     * saveCard()
     * startPolling() / stopPolling()
   - FALTA: useTracking() adecuado (existe pero incompleto)

❌ Sin persistencia coordinada:
   - localStorage disperso
   - Sin AsyncStorage equivalente en web
   - Tokens no se sincronizan con servicios
```

**ACCIÓN REQUERIDA:**
- Considerar migrar a Zustand para estado global
- Crear servicio orquestador de checkout
- Consolidar usePayments() en servicios separados

---

### 5. **FLUJO DE COMPRA INCOMPLETO (50% roto)**

#### En paku-vet-dev (BIEN):
```
✅ Flujo claro definido en docs/flujo-compra-servicio.md:
1. Seleccionar servicio base
2. Agregar addons (opcionales)
3. Carrito creado (active)
4. Validar carrito → if error: abort
5. Checkout (checked_out)
6. Crear orden con dirección
7. Pagar (charge)
8. Confirmar pago (confirm-payment)
9. Orden active (orden enviada, ally acepta)
10. on_the_way (ally reporta ubicación)
11. in_service (ally llegó)
12. done (completada)

✅ Validaciones en cada paso:
   - Cart: válido con items
   - Meta: pet_id, scheduled_date, scheduled_time
   - Dirección: address_id o default
   - Pago: no falla por validación

✅ Estados transitan correctamente:
   - Cart.status: active → checked_out
   - Order.status: created → accepted → on_the_way → in_service → done
```

#### En paku-web (PROBLEMAS):
```
❌ Flujo INCOMPLETO:
   1. ✅ Seleccionar servicio
   2. ✅ Agregar addons
   3. ✅ CartButton mostrar carrito
   4. ❓ Validar carrito — LO HACE PERO:
      - No se integra en UI de checkout
      - Errores no se muestran correctamente
   5. ❓ Checkout — LO HACE PERO:
      - No verifica estado antes
      - No usa paymentService.pay()
   6. ❌ FALTA: crear orden ANTES de pagar
      - En paku-vet-dev: createOrder() luego charge()
      - En paku-web: charge() luego implícitamente createOrder?
   7. ❌ FALTA: paymentStatus polling
      - No hay get-payment-status endpoint consultado
   8. ❌ FALTA: transición de orden
      - No hay on_the_way trigger
      - No hay in_service trigger automático

❌ StepReviewCart.tsx:
   - Muestra carrito bonito
   - PERO: onClick "Proceder a pago":
     * No valida carrito primero
     * No hace checkout
     * Salta directo a StepPayment

❌ StepPayment.tsx:
   - Muestra opciones de tarjeta
   - PERO: handlePayWithNewCard():
     * Crea token ✅
     * Guarda tarjeta ✅
     * Llama pay() ✅
     * PERO: ¿dónde se crea la orden?
       - No se ve createOrder() antes

❌ UsePayments hook:
   - pay() retorna orderId
   - Polling de status existe
   - PERO: No hay transición a on_the_way después
```

**ACCIÓN REQUERIDA:**
- Crear flujo orquestado en booking flow
- Validar → Checkout → CreateOrder → Pay → Confirm
- Agregar webhook/polling para cambios de orden
- Hacer transición automática on_the_way cuando sea necesario

---

## 📋 TABLA COMPARATIVA COMPLETA

| Aspecto | paku-vet-dev | paku-web | Estado |
|---------|--------------|----------|--------|
| **Autenticación** | Zustand + storage | AuthContext | ✅ Similar |
| **Manejo de mascotas** | Guardadas + listadas | Presumiblemente similar | ✅ Probablemente bien |
| **Carrito - crear** | `cartService.createWithItems()` | `cartService.create()` | ✅ Similar |
| **Carrito - validar** | `validate()` retorna valid/errors | `validate()` retorna valid/errors | ✅ Similar |
| **Carrito - checkout** | `checkout()` transita active→checked_out | `checkout()` retorna estado | ⚠️ Falta transición en UI |
| **Orden - crear** | Después de checkout | Después de pago (mal orden) | ❌ Orden equivocada |
| **Pagos - proveedor** | Culqi | Mercado Pago | ❌ Distinto |
| **Pagos - tarjetas guardar** | `saveCard()` en Culqi | `saveCard()` en MP | ❌ Distinto proveedor |
| **Pagos - tarjetas listar** | `/wallet/cards` | `/payment-methods` | ⚠️ Nombres distintos |
| **Pagos - tarjetas delete** | Implementado | NO EXISTE (TODO) | ❌ Falta |
| **Pagos - reintento** | `retry-payment` endpoint | NO EXISTE | ❌ Falta |
| **Tracking - polling current** | `getCurrent()` cada 10s | `getCurrent()` cada 10s | ✅ Similar |
| **Tracking - polling route** | `getRoute()` cada 30s | `getRoute()` cada 30s | ✅ Similar |
| **Tracking - polyline** | Decodifica y dibuja | Decodifica pero no actualiza fluido | ⚠️ UI débil |
| **Tracking - sincronización orden** | En tiempo real | Desacoplado | ❌ Desincronizado |
| **Orden - transición on_the_way** | Automática cuando ally reporta | NO EXISTE | ❌ Falta |
| **Orden - transición in_service** | Automática cuando ally llega | NO EXISTE | ❌ Falta |
| **Mapa - web vs mobile** | React Native Maps | Leaflet | ✅ Correcto por plataforma |
| **Estado global** | Zustand stores | AuthContext + hooks | ⚠️ Menos escalable |
| **Servicios API** | Centralizados + tipos | Centralizados + tipos | ✅ Similar |

---

## 🎯 PRIORIDADES DE CORRECCIÓN

### 🔴 CRÍTICO (Rompe funcionalidad):
1. **Flujo de pagos** — migrará a Culqi, implementar guardado/reutilización
2. **Transición de órdenes** — hacer que order.status transite automáticamente
3. **Sincronización carrito-orden** — validar antes, hacer checkout, crear orden

### 🟠 ALTO (Afecta UX):
4. **Polling de órdenes en tracking** — actualizar estado en tiempo real
5. **Banners de stale** — mostrar cuando datos > 30s sin actualizar
6. **Marcador del ally fluido** — animación de movimiento

### 🟡 MEDIO (Mejoras):
7. **Consolidar estado** — considerar Zustand
8. **Eliminar duplicaciones** — SDK de pagos en un único lugar
9. **Tipos mejorados** — CartItemMeta debe tener estructura

### 🟢 BAJO (Pulido):
10. **Reintentos de pago** — implementar retry-payment endpoint
11. **Eliminar tarjetas** — agregar DELETE endpoint
12. **Transiciones visuales** — mejorar animaciones en mapa

---

## 📝 Conclusión

**paku-web tiene estructura base pero le faltan integraciones críticas.** Los componentes existen pero no trabajan de forma orquestada.

**Criterios a trasladar de paku-vet-dev:**
1. ✅ Flujo de carrito con validación automática
2. ✅ Flujo de orden con transiciones automáticas
3. ✅ Polling coordinado de tracking + orden
4. ✅ Manejo de estado con servicios centralizados
5. ✅ Tipos bien definidos para cada entidad

**Próximo paso:** Crear plan de migración por fases priorizando pagos → carrito → tracking.
