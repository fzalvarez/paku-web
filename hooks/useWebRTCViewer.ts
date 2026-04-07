"use client";

/**
 * Hook WebRTC viewer para el cliente web.
 * Basado en useWebRTC.ts de la app Expo, adaptado para el browser (no react-native-webrtc).
 *
 * Flujo:
 * 1. GET /streaming/orders/{id}/session → obtener ws_url + stream_token + ice_servers
 * 2. Conectar WebSocket a wss://...?token=<JWT>
 * 3. Esperar "offer" del ally (host), responder con "answer"
 * 4. Intercambiar ICE candidates
 * 5. Recibir remoteStream → reproducir en <video>
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { getStreamingSession } from "@/lib/api/streaming";

// ── Configuración ─────────────────────────────────────────────────────────────

const GROOMER_TIMEOUT_MS = 15_000;   // tiempo máx esperando offer del ally
const HEARTBEAT_INTERVAL_MS = 10_000;
const HEARTBEAT_TIMEOUT_MS = 8_000;
const MAX_RETRIES = 4;
const retryDelay = (attempt: number) => Math.min(2000 * Math.pow(2, attempt), 30_000);

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type WebRTCConnectionState =
  | "idle"
  | "fetching_session"   // GET /session
  | "connecting"         // WS abierto, esperando offer del ally
  | "calling"            // ICE checking
  | "connected"          // vídeo activo ✅
  | "disconnected"       // caída temporal
  | "groomer_absent"     // timeout: ally no en la sala
  | "order_not_active"   // 409: la orden no está in_service
  | "reconnecting"       // reintento en curso
  | "failed"             // agotó reintentos
  | "closed";            // cerrado manualmente

export interface UseWebRTCViewerResult {
  remoteStream: MediaStream | null;
  connectionState: WebRTCConnectionState;
  retryCount: number;
  connect: () => void;
  disconnect: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWebRTCViewer(orderId: string): UseWebRTCViewerResult {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<WebRTCConnectionState>("idle");
  const [retryCount, setRetryCount] = useState(0);

  // Refs — mutables sin re-renders
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const groomerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatSendRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatPongRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const isCleanedUpRef = useRef(false);
  const isConnectedRef = useRef(false);
  // Ref para romper la dependencia circular scheduleReconnect ↔ connectInternal
  const connectInternalRef = useRef<() => Promise<void>>(async () => {});

  // ── Timers ────────────────────────────────────────────────────────────────

  const clearTimers = useCallback(() => {
    if (groomerTimerRef.current) { clearTimeout(groomerTimerRef.current); groomerTimerRef.current = null; }
    if (heartbeatSendRef.current) { clearInterval(heartbeatSendRef.current); heartbeatSendRef.current = null; }
    if (heartbeatPongRef.current) { clearTimeout(heartbeatPongRef.current); heartbeatPongRef.current = null; }
    if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
  }, []);

  // ── Cerrar PC + WS ────────────────────────────────────────────────────────

  const closePeerAndSocket = useCallback(() => {
    clearTimers();
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close(1000, "closing");
      wsRef.current = null;
    }
    setRemoteStream(null);
    isConnectedRef.current = false;
  }, [clearTimers]);

  // ── Limpieza total ────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    isCleanedUpRef.current = true;
    closePeerAndSocket();
  }, [closePeerAndSocket]);

  // ── Heartbeat ─────────────────────────────────────────────────────────────

  const startHeartbeat = useCallback((ws: WebSocket) => {
    heartbeatSendRef.current = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return;
      try { ws.send(JSON.stringify({ type: "ping" })); } catch { return; }
      heartbeatPongRef.current = setTimeout(() => {
        if (!isCleanedUpRef.current) ws.close();
      }, HEARTBEAT_TIMEOUT_MS);
    }, HEARTBEAT_INTERVAL_MS);
  }, []);

  // ── Backoff ───────────────────────────────────────────────────────────────

  const scheduleReconnect = useCallback(() => {
    if (isCleanedUpRef.current) return;
    const attempt = retryCountRef.current;
    if (attempt >= MAX_RETRIES) {
      setConnectionState("failed");
      return;
    }
    const delay = retryDelay(attempt);
    retryCountRef.current += 1;
    setRetryCount(retryCountRef.current);
    setConnectionState("reconnecting");
    retryTimerRef.current = setTimeout(() => {
      if (!isCleanedUpRef.current) connectInternalRef.current();
    }, delay);
  }, []);

  // ── Lógica principal ──────────────────────────────────────────────────────

  const connectInternal = useCallback(async () => {
    if (isCleanedUpRef.current || !orderId) return;

    closePeerAndSocket();

    // PASO 1 — Sesión
    setConnectionState("fetching_session");
    let session;
    try {
      session = await getStreamingSession(orderId);
    } catch (err: unknown) {
      if (isCleanedUpRef.current) return;
      if ((err as { status?: number })?.status === 409) {
        setConnectionState("order_not_active");
        return;
      }
      scheduleReconnect();
      return;
    }

    if (isCleanedUpRef.current) return;
    setConnectionState("connecting");

    // PASO 2 — RTCPeerConnection
    const safeIceServers = (session.ice_servers ?? []).map((srv: RTCIceServer & { username?: string; credential?: string }) => {
      const clean: RTCIceServer = { urls: srv.urls };
      if (srv.username) clean.username = srv.username;
      if (srv.credential) clean.credential = srv.credential;
      return clean;
    });

    const pc = new RTCPeerConnection({
      iceServers: safeIceServers.length > 0
        ? safeIceServers
        : [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (isCleanedUpRef.current) return;
      const stream = event.streams?.[0];
      if (stream) setRemoteStream(stream);
    };

    pc.onicecandidate = (event) => {
      if (isCleanedUpRef.current || !event.candidate) return;
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (isCleanedUpRef.current) return;
      switch (pc.iceConnectionState) {
        case "checking":
          setConnectionState("calling");
          break;
        case "connected":
        case "completed":
          isConnectedRef.current = true;
          retryCountRef.current = 0;
          setRetryCount(0);
          setConnectionState("connected");
          clearTimers();
          startHeartbeat(wsRef.current!);
          break;
        case "disconnected":
          setConnectionState("disconnected");
          break;
        case "failed":
        case "closed":
          if (!isCleanedUpRef.current) scheduleReconnect();
          break;
      }
    };

    // PASO 3 — WebSocket
    let wsUrl = session.ws_url;
    if (session.stream_token) {
      const baseUrl = wsUrl.replace(/\/ws.*$/, "");
      wsUrl = `${baseUrl}/ws/realtime?token=${session.stream_token}`;
    }

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      scheduleReconnect();
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      if (isCleanedUpRef.current) return;
      // Timeout: si el ally no envía offer en X segundos → groomer_absent
      if (retryCountRef.current === 0) {
        groomerTimerRef.current = setTimeout(() => {
          if (!isCleanedUpRef.current && !isConnectedRef.current) {
            setConnectionState("groomer_absent");
            cleanup();
          }
        }, GROOMER_TIMEOUT_MS);
      }
    };

    ws.onmessage = async (event) => {
      if (isCleanedUpRef.current) return;
      let msg: { type?: string; candidate?: RTCIceCandidateInit; sdp?: RTCSessionDescriptionInit };
      try { msg = JSON.parse(event.data as string); } catch { return; }

      // Pong del heartbeat
      if (msg.type === "pong") {
        if (heartbeatPongRef.current) {
          clearTimeout(heartbeatPongRef.current);
          heartbeatPongRef.current = null;
        }
        return;
      }

      // Ally terminó la transmisión
      if (msg.type === "stream_ended") {
        setConnectionState("closed");
        cleanup();
        return;
      }

      try {
        // Offer del ally → responder con answer
        if (msg.type === "offer" && msg.sdp) {
          if (groomerTimerRef.current) {
            clearTimeout(groomerTimerRef.current);
            groomerTimerRef.current = null;
          }
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "answer", sdp: pc.localDescription }));
          }
        }

        // ICE candidates del ally
        if ((msg.type === "ice-candidate" || msg.type === "candidate") && msg.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
        }
        // Formato raw sin type
        if (msg.candidate !== undefined && msg.type === undefined) {
          await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
        }
      } catch (err) {
        console.error("[WebRTCViewer] Error en señalización:", err);
      }
    };

    ws.onerror = () => {
      // onclose siempre llega después — reconectar allí
    };

    ws.onclose = () => {
      if (isCleanedUpRef.current) return;
      if (heartbeatSendRef.current) { clearInterval(heartbeatSendRef.current); heartbeatSendRef.current = null; }
      if (heartbeatPongRef.current) { clearTimeout(heartbeatPongRef.current); heartbeatPongRef.current = null; }

      const state = connectionState;
      if (state === "groomer_absent" || state === "order_not_active") return;

      scheduleReconnect();
    };
  }, [orderId, closePeerAndSocket, clearTimers, startHeartbeat, scheduleReconnect, cleanup, connectionState]);

  // Mantener el ref sincronizado con la versión más reciente del callback
  useEffect(() => {
    connectInternalRef.current = connectInternal;
  }, [connectInternal]);

  // ── API pública ───────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    isCleanedUpRef.current = false;
    retryCountRef.current = 0;
    setRetryCount(0);
    setConnectionState("idle");
    connectInternalRef.current();
  }, []);

  const disconnect = useCallback(() => {
    cleanup();
    setConnectionState("closed");
  }, [cleanup]);

  useEffect(() => {
    return () => { cleanup(); };
  }, [cleanup]);

  return { remoteStream, connectionState, retryCount, connect, disconnect };
}
