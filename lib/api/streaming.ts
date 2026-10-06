/**
 * Servicio de streaming WebRTC para órdenes activas.
 * El viewer (cliente) se conecta para ver la transmisión del groomer.
 */
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

export interface StreamingSession {
  room_id: string;
  order_id: string;
  user_id: string;
  groomer_id: string;
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

/**
 * GET /streaming/orders/{order_id}/session
 * 409 si la orden no está activa (lo maneja useWebRTCViewer con err.status).
 */
export function getStreamingSession(orderId: string): Promise<StreamingSession> {
  return apiClient.get<StreamingSession>(ENDPOINTS.STREAMING.SESSION(orderId));
}
