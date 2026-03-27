# Documentación de Integración — Sistema de Streaming en Vivo (Paku)

> **Destinatario:** Desarrollador web  
> **Versión:** 1.0  
> **Fecha:** Marzo 2026

---

## 1. Visión General

El sistema de streaming de Paku permite al **groomer (ally)** transmitir video en vivo mientras realiza el servicio, y al **usuario (cliente)** verlo en tiempo real desde su dispositivo.

La arquitectura usa tres componentes:

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Groomer   │◄───WS──►│ Signaling Server │◄───WS──►│   Usuario   │
│   (host)    │         │  stream.dev-qa   │         │  (viewer)   │
└──────┬──────┘         └──────────────────┘         └──────┬──────┘
       │                                                     │
       └──────────────── WebRTC (TURN) ────────────────────┘
                        Video/Audio directo
```

- **Backend principal** (`paku.dev-qa.site`) — API REST, autenticación, órdenes
- **Signaling Server** (`stream.dev-qa.site`) — WebSocket para intercambio de señales WebRTC
- **Servidor TURN** (`stream.dev-qa.site:3478`) — Relay de video/audio cuando no hay conexión directa

---

## 2. Autenticación y Sesión

### 2.1 Obtener la sesión de streaming

Antes de conectar al WebSocket, tanto el groomer como el usuario deben obtener los datos de sesión del backend principal.

**Endpoint:**
```
GET /streaming/orders/{order_id}/session
Authorization: Bearer <access_token>
```

**Respuesta:**
```json
{
  "room_id": "uuid-de-la-sala",
  "ws_url": "wss://stream.dev-qa.site/ws?room=uuid-de-la-sala",
  "role": "host",
  "stream_token": "eyJhbGciOiJIUzI1NiJ9...",
  "ice_servers": [
    {
      "urls": ["stun:stun.l.google.com:19302"],
      "username": null,
      "credential": null
    },
    {
      "urls": [
        "turn:stream.dev-qa.site:3478?transport=udp",
        "turn:stream.dev-qa.site:3478?transport=tcp"
      ],
      "username": "webrtc",
      "credential": "webrtc123"
    }
  ]
}
```

| Campo | Descripción |
|---|---|
| `role` | `"host"` para el groomer, `"viewer"` para el usuario |
| `stream_token` | JWT firmado con exp de 5 minutos — usar para autenticar en el WS |
| `ice_servers` | Servidores STUN/TURN para WebRTC |
| `ws_url` | URL base del signaling — NO incluye el token |

> ⚠️ **El `stream_token` expira en 5 minutos.** Pedir siempre una nueva sesión en cada intento de conexión. Nunca reutilizar un token de un intento anterior.

### 2.2 Códigos de error del endpoint

| Código | Significado |
|---|---|
| `401` | Token de acceso inválido o expirado |
| `403` | El usuario no tiene acceso a esa orden |
| `404` | Orden no encontrada |
| `409` | La orden no está en estado `in_service` |

---

## 3. Conexión al Signaling Server (WebSocket)

### 3.1 Construir la URL de conexión

El `stream_token` debe enviarse como query param en la URL del WebSocket. El signaling server lo valida durante el handshake HTTP.

```javascript
const wsUrl = `wss://stream.dev-qa.site/ws/realtime?token=${stream_token}`;
const ws = new WebSocket(wsUrl);
```

> ⚠️ **Los WebSockets no soportan el header `Authorization`**. El token siempre va en la URL como `?token=`.

### 3.2 Sanear los ice_servers

El backend puede devolver servidores ICE con `username: null` y `credential: null`. Algunos clientes WebRTC (como `react-native-webrtc`) crashean con eso. Limpiar antes de crear el `RTCPeerConnection`:

```javascript
const safeIceServers = ice_servers.map(srv => {
  const clean = { urls: srv.urls };
  if (srv.username) clean.username = srv.username;
  if (srv.credential) clean.credential = srv.credential;
  return clean;
});

const pc = new RTCPeerConnection({ iceServers: safeIceServers });
```

---

## 4. Formato de Mensajes

Todos los mensajes son JSON. El campo `type` define el tipo de mensaje.

### Offer (groomer → signaling → usuario)
```json
{
  "type": "offer",
  "sdp": {
    "type": "offer",
    "sdp": "v=0\r\no=- ..."
  }
}
```

### Answer (usuario → signaling → groomer)
```json
{
  "type": "answer",
  "sdp": {
    "type": "answer",
    "sdp": "v=0\r\no=- ..."
  }
}
```

### Candidato ICE
```json
{
  "type": "ice-candidate",
  "candidate": {
    "candidate": "candidate:...",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```

### Ping / Pong (heartbeat del signaling)
```json
{ "type": "ping" }
{ "type": "pong" }
```
> El signaling envía `ping` cada ~10 segundos. El cliente **debe responder con `pong`** para mantener la conexión viva.

### Viewer Joined (signaling → groomer)
```json
{ "type": "viewer_joined" }
```
> El signaling notifica al groomer cuando un nuevo viewer entra a la sala.

---

## 5. Flujo Completo del Groomer (Host)

```
1. GET /streaming/orders/{id}/session  →  obtener stream_token e ice_servers
2. Crear RTCPeerConnection con ice_servers saneados
3. Agregar tracks de cámara/micrófono al PC  (getUserMedia)
4. Abrir WebSocket: wss://stream.dev-qa.site/ws/realtime?token={stream_token}
5. ws.onopen → createOffer() → setLocalDescription → send offer por WS
6. Esperar answer del viewer
7. ws.onmessage type="answer" → setRemoteDescription
8. ws.onmessage type="ice-candidate" → addIceCandidate
9. ICE connected → transmisión activa ✅
10. ws.onmessage type="ping" → responder { type: "pong" }
11. ws.onmessage type="viewer_joined" → reenviar offer fresco (si no hay conexión activa)
```

### Código de referencia

```javascript
// PASO 1 — Obtener sesión
const session = await fetch(`/streaming/orders/${orderId}/session`, {
  headers: { Authorization: `Bearer ${accessToken}` }
}).then(r => r.json());

// PASO 2 y 3 — PC con tracks de cámara
const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
const safeIceServers = session.ice_servers.map(sanitize); // ver sección 3.2
const pc = new RTCPeerConnection({ iceServers: safeIceServers });
stream.getTracks().forEach(track => pc.addTrack(track, stream));

// PASO 4 — WebSocket
const ws = new WebSocket(`wss://stream.dev-qa.site/ws/realtime?token=${session.stream_token}`);

// PASO 5 — Offer al conectar
ws.onopen = async () => {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  ws.send(JSON.stringify({ type: "offer", sdp: pc.localDescription }));
};

// Candidatos ICE propios
pc.onicecandidate = (event) => {
  if (event.candidate && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
  }
};

// Mensajes entrantes
ws.onmessage = async (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "ping") {
    ws.send(JSON.stringify({ type: "pong" }));
    return;
  }

  if (msg.type === "answer" && pc.signalingState === "have-local-offer") {
    await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp ?? msg));
  }

  if (msg.type === "ice-candidate" && msg.candidate) {
    await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
  }

  if (msg.type === "viewer_joined") {
    const iceState = pc.iceConnectionState;
    if (iceState !== "connected" && iceState !== "completed") {
      // Reenviar offer fresco para el nuevo viewer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify({ type: "offer", sdp: pc.localDescription }));
    }
  }
};
```

---

## 6. Flujo Completo del Usuario (Viewer)

```
1. GET /streaming/orders/{id}/session  →  obtener stream_token e ice_servers
2. Crear RTCPeerConnection con ice_servers saneados
3. Abrir WebSocket: wss://stream.dev-qa.site/ws/realtime?token={stream_token}
4. Esperar offer del groomer (puede ser buffered si el groomer ya está transmitiendo)
5. ws.onmessage type="offer" → setRemoteDescription → createAnswer → setLocalDescription → send answer
6. ws.onmessage type="ice-candidate" → addIceCandidate
7. pc.ontrack → recibir stream de video del groomer ✅
8. ws.onmessage type="ping" → responder { type: "pong" }
```

> ℹ️ **El signaling hace buffer del último offer del groomer.** Si el groomer ya está transmitiendo cuando el usuario entra, el signaling entrega el offer automáticamente sin que el groomer tenga que hacer nada.

### Código de referencia

```javascript
// PASO 1 — Obtener sesión
const session = await fetch(`/streaming/orders/${orderId}/session`, {
  headers: { Authorization: `Bearer ${accessToken}` }
}).then(r => r.json());

// PASO 2 — PC
const safeIceServers = session.ice_servers.map(sanitize);
const pc = new RTCPeerConnection({ iceServers: safeIceServers });

// Recibir video del groomer
pc.ontrack = (event) => {
  const videoElement = document.getElementById("remote-video");
  videoElement.srcObject = event.streams[0];
};

// Candidatos ICE propios
pc.onicecandidate = (event) => {
  if (event.candidate && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
  }
};

// PASO 3 — WebSocket
const ws = new WebSocket(`wss://stream.dev-qa.site/ws/realtime?token=${session.stream_token}`);

// Mensajes entrantes
ws.onmessage = async (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "ping") {
    ws.send(JSON.stringify({ type: "pong" }));
    return;
  }

  // Offer del groomer (puede llegar más de uno — responder a cada uno)
  if (msg.type === "offer") {
    const sdp = msg.sdp ?? msg;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    ws.send(JSON.stringify({ type: "answer", sdp: pc.localDescription }));
  }

  if (msg.type === "ice-candidate" && msg.candidate) {
    await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
  }
};
```

---

## 7. Manejo de Reconexión

### 7.1 Cuándo reconectar

| Evento ICE | Acción recomendada |
|---|---|
| `disconnected` | Esperar — puede ser transitorio o que el viewer salió |
| `failed` | Reconectar completamente con nueva sesión |
| WS `onclose` con code ≠ 1000 | Reconectar con backoff exponencial |
| WS `onclose` con code `1000` | Cierre intencional — no reconectar |

### 7.2 Backoff exponencial recomendado

```javascript
const delays = [2000, 4000, 8000, 16000]; // ms
let attempt = 0;

function scheduleReconnect() {
  if (attempt >= delays.length) {
    console.error("Max reintentos alcanzado");
    return;
  }
  setTimeout(() => {
    connect(); // pide nueva sesión y reconecta
  }, delays[attempt++]);
}
```

### 7.3 Reglas importantes

- **Siempre pedir nueva sesión** en cada reconexión — el `stream_token` expira en 5 min y las credenciales TURN son por sesión
- **No reutilizar** el `RTCPeerConnection` después de un `failed` — crear uno nuevo
- **Cerrar el WS** con `ws.close(1000, "closing")` al salir manualmente para que el signaling registre el cierre limpio

---

## 8. Gestión del Offer Duplicado (caso groomer)

Cuando el usuario entra a una sala donde el groomer ya transmite, puede ocurrir que el groomer reciba dos answers:

1. Uno por el offer buffered que el signaling entregó automáticamente
2. Otro por el offer fresco que el groomer reenvió en respuesta al `viewer_joined`

**Solución:** Solo procesar el answer cuando el `signalingState` del PC es `have-local-offer`:

```javascript
if (msg.type === "answer") {
  if (pc.signalingState !== "have-local-offer") {
    console.log("Answer ignorado — PC en estado:", pc.signalingState);
    return;
  }
  await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp ?? msg));
}
```

---

## 9. Resumen de URLs y Credenciales (QA)

| Recurso | URL |
|---|---|
| API principal | `https://paku.dev-qa.site/paku/api/v1` |
| Signaling WebSocket | `wss://stream.dev-qa.site/ws/realtime?token=<stream_token>` |
| TURN UDP | `turn:stream.dev-qa.site:3478?transport=udp` |
| TURN TCP | `turn:stream.dev-qa.site:3478?transport=tcp` |
| STUN | `stun:stun.l.google.com:19302` |

**Credenciales TURN (QA):**
- Username: `webrtc`
- Credential: `webrtc123`

> ⚠️ Estas credenciales son solo para el entorno QA. En producción se usarán credenciales dinámicas.

---

## 10. Checklist de Implementación

- [ ] Llamar `GET /session` antes de cada intento de conexión (no cachear)
- [ ] Sanear `ice_servers` — remover keys `username`/`credential` si son `null`
- [ ] Construir WS URL con `?token={stream_token}`
- [ ] Responder `pong` a cada `ping` del signaling
- [ ] El groomer: enviar offer en `ws.onopen`
- [ ] El groomer: reenviar offer fresco cuando llega `viewer_joined` (si no hay conexión activa)
- [ ] El groomer: solo aceptar answer cuando `signalingState === "have-local-offer"`
- [ ] El usuario: tolerar múltiples offers — responder con answer a cada uno
- [ ] Reconexión: siempre con nueva sesión, nunca reutilizar `stream_token`
- [ ] Cierre: `ws.close(1000, "closing")` al salir manualmente
