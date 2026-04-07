/**
 * Servicio de streaming WebRTC para órdenes activas.
 * El viewer (cliente) se conecta para ver la transmisión del ally (groomer).
 */
import { getAccessToken } from "@/lib/session";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://paku.dev-qa.site/paku/api/v1"
).replace(/\/$/, "");

export interface StreamingSession {
  room_id: string;
  order_id: string;
  user_id: string;
  ally_id: string;
  order_status: string;
  /** "viewer" para el cliente web */
  role: "host" | "viewer";
  /** URL base del signaling WebSocket */
  ws_url: string;
  /** Servidores ICE (STUN/TURN) provistos por el backend */
  ice_servers: RTCIceServer[];
  /** JWT firmado para autenticar en el signaling — va como ?token= en el WS */
  stream_token: string | null;
}

export async function getStreamingSession(orderId: string): Promise<StreamingSession> {
  const token = getAccessToken();

  const res = await fetch(`${BASE_URL}/streaming/orders/${orderId}/session`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(`Streaming session error: ${res.status}`), {
      status: res.status,
      data: err,
    });
  }

  return res.json();
}
