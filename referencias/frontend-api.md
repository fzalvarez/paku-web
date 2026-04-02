# Documentacion de consumo para frontend

Esta guia resume como consumir las APIs expuestas por este servicio desde el frontend.

## Base URL

En local, la API expone estas rutas:

- `https://stream.dev-qa.site/payment/health`
- `https://stream.dev-qa.site/payment/api/payment-methods`
- `https://stream.dev-qa.site/payment/api/payments/pay`
- `https://stream.dev-qa.site/payment/api/payments/{order_id}/status`

Si el backend corre en otro host o puerto, solo cambia la base URL.

## Autenticacion

Las rutas de frontend que requieren usuario autenticado esperan un header Bearer:

```http
Authorization: Bearer <token>
```

### Token de prueba

Token JWT de prueba valido para este proyecto:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiZW1haWwiOiJxYUBsb2NhbC50ZXN0In0._oJS2BJJknCrOBnD_DsBwMjEJCyatbLVOr_yYB3Dgdw
```

Datos contenidos en ese token:

- `user_id`: `00000000-0000-0000-0000-000000000001`
- `email`: `qa@local.test`
- No tiene `exp`, por lo que en este proyecto no vence.

## Endpoint 1: guardar tarjeta

`POST /api/payment-methods`

Guarda una tarjeta para el usuario autenticado y la asocia con el customer de Mercado Pago.

### Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Body

```json
{
  "card_token": "tok_xxxxxxxxxxxxx"
}
```

### Aclaracion importante sobre `card_token`

`card_token` no lo genera este backend. Debe salir del formulario seguro de Mercado Pago en el frontend.

En otras palabras:

- El frontend monta el CardForm o Secure Fields de Mercado Pago.
- Mercado Pago tokeniza los datos sensibles de la tarjeta.
- El frontend recibe un token temporal de tarjeta.
- Ese valor es el que se envia como `card_token` al backend.

Este servicio nunca espera numero de tarjeta, CVV ni fecha completa en texto plano.

### Respuesta esperada

```json
{
  "id": "0f4f6b5b-7e76-4bc0-bf9d-1ac5fbff5abc",
  "brand": "visa",
  "last4": "1234",
  "exp_month": 12,
  "exp_year": 2030
}
```

### Ejemplo `fetch`

```js
const response = await fetch("https://stream.dev-qa.site/payment/api/payment-methods", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    card_token: mpCardToken,
  }),
});

const data = await response.json();
```

## Endpoint 2: listar tarjetas guardadas

`GET /api/payment-methods`

Devuelve las tarjetas guardadas del usuario autenticado.

### Headers

```http
Authorization: Bearer <token>
```

### Respuesta esperada

```json
[
  {
    "id": "0f4f6b5b-7e76-4bc0-bf9d-1ac5fbff5abc",
    "brand": "visa",
    "last4": "1234",
    "exp_month": 12,
    "exp_year": 2030
  }
]
```

### Ejemplo `fetch`

```js
const response = await fetch("https://stream.dev-qa.site/payment/api/payment-methods", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const cards = await response.json();
```

## Endpoint 3: pagar

`POST /api/payments/pay`

Crea o reutiliza una orden y genera un intento de pago en Mercado Pago.

### Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Body base

```json
{
  "cart_id": "11111111-1111-1111-1111-111111111111",
  "amount": 1500,
  "currency": "PEN"
}
```

### Caso A: pago con tarjeta nueva

```json
{
  "cart_id": "11111111-1111-1111-1111-111111111111",
  "amount": 1500,
  "currency": "PEN",
  "card_token": "tok_xxxxxxxxxxxxx",
  "payment_method_id": "visa",
  "installments": 1,
  "save_card": false
}
```

Notas:

- `card_token` sale del frontend de Mercado Pago.
- `payment_method_id` es el identificador del medio de pago que reconoce Mercado Pago, por ejemplo `visa`, `master` o similar.
- `save_card` hoy no cambia el comportamiento del backend en este endpoint. Si quieres guardar una tarjeta, usa `POST /api/payment-methods`.

### Caso B: pago con tarjeta guardada

```json
{
  "cart_id": "11111111-1111-1111-1111-111111111111",
  "amount": 1500,
  "currency": "PEN",
  "saved_payment_method_id": "0f4f6b5b-7e76-4bc0-bf9d-1ac5fbff5abc",
  "card_token": "tok_xxxxxxxxxxxxx",
  "installments": 1
}
```

Notas importantes del comportamiento actual:

- Aunque la tarjeta ya este guardada, este backend igual exige `card_token`.
- Ese `card_token` tambien debe venir del frontend de Mercado Pago al momento de confirmar el pago.
- Cuando se usa `saved_payment_method_id`, el backend obtiene internamente la marca (`brand`) de la tarjeta guardada y la manda a Mercado Pago como `payment_method_id`.

### Respuesta esperada

```json
{
  "order_id": "f29f0a89-4eb6-4d90-a0c9-df4467a8f20f",
  "status": "PROCESSING"
}
```

### Estados posibles de orden

- `PENDING`
- `PROCESSING`
- `PAID`
- `FAILED`
- `CANCELLED`

Importante:

- Justo despues de `POST /api/payments/pay`, lo mas normal es recibir `PROCESSING`.
- El estado final puede cambiar despues por webhook de Mercado Pago.

### Ejemplo `fetch` con tarjeta nueva

```js
const response = await fetch("https://stream.dev-qa.site/payment/api/payments/pay", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    cart_id: cartId,
    amount: 1500,
    currency: "PEN",
    card_token: mpCardToken,
    payment_method_id: paymentMethodId,
    installments: 1,
    save_card: false,
  }),
});

const payment = await response.json();
```

### Ejemplo `fetch` con tarjeta guardada

```js
const response = await fetch("https://stream.dev-qa.site/payment/api/payments/pay", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    cart_id: cartId,
    amount: 1500,
    currency: "PEN",
    saved_payment_method_id: selectedCardId,
    card_token: mpCardToken,
    installments: 1,
  }),
});

const payment = await response.json();
```

## Endpoint 4: consultar estado de pago

`GET /api/payments/{order_id}/status`

Devuelve el estado actual de una orden.

### Headers

Este endpoint actualmente no exige Bearer token.

### Respuesta esperada

```json
{
  "order_id": "f29f0a89-4eb6-4d90-a0c9-df4467a8f20f",
  "status": "PAID"
}
```

### Ejemplo `fetch`

```js
const response = await fetch(
  `https://stream.dev-qa.site/payment/api/payments/${orderId}/status`
);

const status = await response.json();
```

## Flujo sugerido para frontend

### Guardar tarjeta

1. El frontend obtiene `card_token` desde Mercado Pago.
2. Llama a `POST /api/payment-methods`.
3. Guarda el `id` devuelto para futuros pagos.

### Pagar con tarjeta nueva

1. El frontend obtiene `card_token` desde Mercado Pago.
2. Llama a `POST /api/payments/pay`.
3. Toma `order_id`.
4. Consulta `GET /api/payments/{order_id}/status` hasta obtener estado final.

### Pagar con tarjeta guardada

1. El frontend lista tarjetas con `GET /api/payment-methods`.
2. El usuario selecciona una tarjeta guardada.
3. El frontend vuelve a obtener un `card_token` de Mercado Pago para la confirmacion.
4. Llama a `POST /api/payments/pay` con `saved_payment_method_id` y `card_token`.
5. Consulta el estado de la orden.

## Manejo de errores

### Errores de validacion o negocio frecuentes

`400 Bad Request`

Ejemplo:

```json
{
  "detail": {
    "provider": "mercado_pago",
    "type": "PAYMENT_REJECTED",
    "code": "card_declined",
    "message": "Card declined"
  }
}
```

Codigos de negocio mapeados por el backend:

- `invalid_card_token`
- `card_declined`
- `insufficient_funds`
- `invalid_installments`
- `fraud_detected`
- `payment_method_not_allowed`
- `payment_provider_error`
- `network_error`

`404 Not Found` al consultar una orden inexistente:

```json
{
  "detail": {
    "error": {
      "code": "order_not_found",
      "message": "Order not found"
    }
  }
}
```

`422 Unprocessable Entity`

Puede pasar si no envias `card_token` en un flujo que lo requiere.

## Endpoint interno de webhook

`POST /api/webhooks/mercado-pago`

Este endpoint es para Mercado Pago, no para el frontend.
El frontend no necesita consumirlo.
