"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { ordersService } from "@/lib/api/orders";
import { useTracking } from "@/hooks/useTracking";
import { useWebRTCViewer } from "@/hooks/useWebRTCViewer";
import {
  Loader2, AlertCircle, MapPin, CalendarDays, Package,
  ArrowLeft, CheckCircle2, Clock, Truck, Scissors,
  Navigation, Wifi, WifiOff, RefreshCw, ExternalLink,
  Video, VideoOff, Signal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { OrderOut, OrderStatus } from "@/types/orders";

// ── Config de estados ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: React.ReactNode; color: string; bgColor: string; description: string }
> = {
  created: {
    label: "Pendiente de asignación",
    icon: <Clock className="size-5" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
    description: "Tu pedido fue creado y está esperando que le asignemos un especialista.",
  },
  on_the_way: {
    label: "Especialista en camino",
    icon: <Truck className="size-5" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    description: "Tu especialista ya salió y está dirigiéndose a tu domicilio.",
  },
  in_service: {
    label: "Servicio en curso",
    icon: <Scissors className="size-5" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
    description: "El especialista llegó y el servicio está en progreso.",
  },
  done: {
    label: "Servicio finalizado",
    icon: <CheckCircle2 className="size-5" />,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    description: "¡Servicio completado! Esperamos que tu mascota quede feliz.",
  },
  cancelled: {
    label: "Cancelado",
    icon: <AlertCircle className="size-5" />,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    description: "Este pedido fue cancelado.",
  },
};

// Solo estos 3 estados son relevantes para la barra de progreso del tracking
type TrackingFlowStatus = "on_the_way" | "in_service" | "done";
const TRACKING_FLOW: TrackingFlowStatus[] = ["on_the_way", "in_service", "done"];

const TRACKING_FLOW_CONFIG: Record<TrackingFlowStatus, {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  activeColor: string;
  activeBg: string;
  activeRing: string;
  activeBorder: string;
  activeBgLight: string;
}> = {
  on_the_way: {
    label: "En camino",
    sublabel: "Especialista en ruta",
    icon: <Truck className="size-5" />,
    activeColor: "text-blue-600",
    activeBg: "bg-blue-600",
    activeRing: "ring-blue-200",
    activeBorder: "border-blue-600",
    activeBgLight: "bg-blue-50",
  },
  in_service: {
    label: "En servicio",
    sublabel: "Atendiendo a tu mascota",
    icon: <Scissors className="size-5" />,
    activeColor: "text-purple-600",
    activeBg: "bg-purple-600",
    activeRing: "ring-purple-200",
    activeBorder: "border-purple-600",
    activeBgLight: "bg-purple-50",
  },
  done: {
    label: "Finalizado",
    sublabel: "Servicio completado",
    icon: <CheckCircle2 className="size-5" />,
    activeColor: "text-green-600",
    activeBg: "bg-green-600",
    activeRing: "ring-green-200",
    activeBorder: "border-green-600",
    activeBgLight: "bg-green-50",
  },
} as const;

// Flujo completo para la barra de progreso inferior
const STATUS_FLOW: OrderStatus[] = ["created", "on_the_way", "in_service", "done"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatScheduledDate(iso: string, time?: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dateStr = new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return time ? `${dateStr} a las ${time}` : dateStr;
}

function mapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function mapsEmbedUrl(allyLat: number, allyLng: number, destLat: number, destLng: number): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  // Si no hay API key, usamos una URL de iframe simple que no requiere key
  if (!apiKey) {
    return `https://maps.google.com/maps?q=${allyLat},${allyLng}&z=15&output=embed`;
  }
  // Con API key: mapa con origen (ally) y destino marcados
  return `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${allyLat},${allyLng}&destination=${destLat},${destLng}&mode=driving`;
}

// ── Sub-componente: mapa de ubicación del ally ────────────────────────────────

interface AllyMapProps {
  allyLat: number;
  allyLng: number;
  destLat: number;
  destLng: number;
  destAddress: string;
  isStale: boolean;
  etaDisplay: string | null;
}

function AllyMap({ allyLat, allyLng, destLat, destLng, destAddress, isStale, etaDisplay }: AllyMapProps) {
  const embedUrl = mapsEmbedUrl(allyLat, allyLng, destLat, destLng);

  return (
    <div className="space-y-2">
      {/* Mapa embebido */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-muted aspect-video">
        <iframe
          src={embedUrl}
          className="absolute inset-0 h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación del especialista"
        />
      </div>

      {/* Barra inferior: estado de señal + ETA + link externo */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Señal */}
        <div className="flex items-center gap-1.5">
          {isStale ? (
            <>
              <WifiOff className="size-3 text-yellow-500" />
              <span className="text-[10px] text-yellow-600">Ubicación puede no ser exacta</span>
            </>
          ) : (
            <>
              <Wifi className="size-3 text-green-500" />
              <span className="text-[10px] text-muted-foreground">Actualizada hace segundos</span>
            </>
          )}
        </div>

        {/* ETA */}
        {etaDisplay && (
          <span className="flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            <Clock className="size-3 shrink-0" />
            {etaDisplay}
          </span>
        )}

        {/* Abrir en Google Maps */}
        <a
          href={mapsUrl(allyLat, allyLng)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
        >
          <ExternalLink className="size-3" />
          Ver en Maps
        </a>
      </div>

      {/* Destino */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-1.5">
        <MapPin className="size-3.5 shrink-0 text-primary" />
        <span className="text-xs text-muted-foreground truncate">{destAddress}</span>
      </div>
    </div>
  );
}

// ── Sub-componente: streaming WebRTC ─────────────────────────────────────────

interface StreamingViewerProps {
  orderId: string;
}

const STREAMING_STATE_LABELS: Record<string, string> = {
  idle: "Iniciando...",
  fetching_session: "Conectando...",
  connecting: "Esperando al especialista...",
  calling: "Estableciendo llamada...",
  connected: "En directo",
  disconnected: "Reconectando...",
  groomer_absent: "El especialista aún no ha iniciado la transmisión",
  order_not_active: "La transmisión no está disponible ahora",
  reconnecting: "Reconectando...",
  failed: "No se pudo conectar",
  closed: "Transmisión finalizada",
};

function StreamingViewer({ orderId }: StreamingViewerProps) {
  const { remoteStream, connectionState, retryCount, connect, disconnect } =
    useWebRTCViewer(orderId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStarted, setIsStarted] = useState(false);

  // Asignar el stream al elemento <video> cuando llega
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleStart = () => {
    setIsStarted(true);
    connect();
  };

  const handleStop = () => {
    disconnect();
    setIsStarted(false);
  };

  const isConnected = connectionState === "connected";
  const isLoading = ["fetching_session", "connecting", "calling", "reconnecting"].includes(connectionState);
  const isError = ["failed", "groomer_absent", "order_not_active"].includes(connectionState);

  return (
    <div className="space-y-3">
      {/* Área de vídeo */}
      <div className={cn(
        "relative overflow-hidden rounded-xl border-2 bg-black aspect-video flex items-center justify-center",
        isConnected ? "border-purple-500/50" : "border-border"
      )}>
        {/* Vídeo real */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity",
            isConnected && remoteStream ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Overlay cuando no hay vídeo */}
        {(!isConnected || !remoteStream) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            {!isStarted ? (
              <>
                <div className="flex size-14 items-center justify-center rounded-full bg-purple-100">
                  <Video className="size-7 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Ver transmisión en vivo</p>
                  <p className="mt-1 text-xs text-white/60">
                    El especialista está atendiendo a tu mascota
                  </p>
                </div>
                <button
                  onClick={handleStart}
                  className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-700 transition-colors"
                >
                  Iniciar transmisión
                </button>
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="size-8 animate-spin text-white/60" />
                <p className="text-xs text-white/60">{STREAMING_STATE_LABELS[connectionState]}</p>
                {retryCount > 0 && (
                  <p className="text-[10px] text-white/40">Intento {retryCount}/4</p>
                )}
              </>
            ) : isError ? (
              <>
                <VideoOff className="size-8 text-white/40" />
                <p className="text-xs text-white/60 text-center">{STREAMING_STATE_LABELS[connectionState]}</p>
                {connectionState === "failed" && (
                  <button
                    onClick={() => connect()}
                    className="rounded-xl border border-white/20 px-4 py-1.5 text-xs text-white/70 hover:bg-white/10 transition-colors"
                  >
                    Reintentar
                  </button>
                )}
              </>
            ) : (
              <Loader2 className="size-8 animate-spin text-white/60" />
            )}
          </div>
        )}

        {/* Badge "EN VIVO" cuando hay conexión */}
        {isConnected && remoteStream && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1">
            <span className="size-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold text-white tracking-wide">EN VIVO</span>
          </div>
        )}

        {/* Badge de señal */}
        {isConnected && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1">
            <Signal className="size-3 text-green-400" />
            <span className="text-[10px] text-green-400">Conectado</span>
          </div>
        )}
      </div>

      {/* Controles */}
      {isStarted && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {STREAMING_STATE_LABELS[connectionState] ?? connectionState}
          </p>
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
          >
            <VideoOff className="size-3.5" />
            Salir
          </button>
        </div>
      )}
    </div>
  );
}

// ── Panel de tracking ─────────────────────────────────────────────────────────

interface TrackingPanelProps {
  orderId: string;
  orderStatus: OrderStatus;
  destination: { lat: number; lng: number; address_line: string } | null;
}

function TrackingPanel({ orderId, orderStatus, destination }: TrackingPanelProps) {
  const { current, loading, error, isActive, isStale, etaDisplay } =
    useTracking(orderId, orderStatus);

  const isInTrackingFlow = (TRACKING_FLOW as string[]).includes(orderStatus);
  const trackingFlowIdx = isInTrackingFlow
    ? TRACKING_FLOW.indexOf(orderStatus as TrackingFlowStatus)
    : -1;

  const isOnTheWay = orderStatus === "on_the_way";
  const isInService = orderStatus === "in_service";

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Cabecera */}
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="size-4 text-primary" />
            <span className="text-sm font-bold">Seguimiento del servicio</span>
          </div>
          {isActive && (
            <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
              En vivo
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* ── Barra de progreso de 3 estados ── */}
        {isInTrackingFlow ? (
          <div className="flex items-start gap-0">
            {TRACKING_FLOW.map((step, idx) => {
              const conf = TRACKING_FLOW_CONFIG[step];
              const isPast = idx < trackingFlowIdx;
              const isCurrentStep = idx === trackingFlowIdx;
              return (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    <div className={cn(
                      "h-0.5 flex-1 transition-all",
                      idx === 0 ? "invisible" : isPast || isCurrentStep ? "bg-primary" : "bg-border"
                    )} />
                    <div className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      isPast && "border-primary bg-primary text-primary-foreground",
                      isCurrentStep && [conf.activeBorder, conf.activeBgLight, conf.activeColor, "ring-4", conf.activeRing],
                      !isPast && !isCurrentStep && "border-border bg-muted text-muted-foreground"
                    )}>
                      {isPast ? <CheckCircle2 className="size-5" /> : conf.icon}
                    </div>
                    <div className={cn(
                      "h-0.5 flex-1 transition-all",
                      idx === TRACKING_FLOW.length - 1 ? "invisible" : isPast ? "bg-primary" : "bg-border"
                    )} />
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      "text-xs font-bold",
                      isCurrentStep ? conf.activeColor : isPast ? "text-primary/70" : "text-muted-foreground"
                    )}>
                      {conf.label}
                    </p>
                    {isCurrentStep && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">{conf.sublabel}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-2">
            El seguimiento estará disponible cuando el especialista esté en camino.
          </p>
        )}

        {/* ── EN CAMINO: mapa de ubicación del ally ── */}
        {isOnTheWay && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Truck className="size-3.5" />
              Especialista en camino
            </p>
            {loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground rounded-xl bg-muted/30">
                <Loader2 className="size-4 animate-spin" />
                Obteniendo ubicación…
              </div>
            )}
            {!loading && current?.ally_location && destination ? (
              <AllyMap
                allyLat={current.ally_location.lat}
                allyLng={current.ally_location.lng}
                destLat={destination.lat}
                destLng={destination.lng}
                destAddress={destination.address_line}
                isStale={isStale}
                etaDisplay={etaDisplay}
              />
            ) : !loading && (
              <div className="flex flex-col items-center gap-2 py-6 rounded-xl bg-muted/30 text-center">
                <Navigation className="size-6 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">
                  Esperando la ubicación del especialista…
                </p>
                {destination && (
                  <a
                    href={mapsUrl(destination.lat, destination.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <MapPin className="size-3.5" />
                    Ver destino en Maps
                  </a>
                )}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                <AlertCircle className="size-3.5 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* ── EN SERVICIO: streaming WebRTC ── */}
        {isInService && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Scissors className="size-3.5" />
              Transmisión en vivo
            </p>
            <StreamingViewer orderId={orderId} />
          </div>
        )}

        {/* ── FINALIZADO: destino ── */}
        {orderStatus === "done" && destination && (
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dirección del servicio</p>
              <p className="text-sm font-semibold truncate">{destination.address_line}</p>
            </div>
            <a
              href={mapsUrl(destination.lat, destination.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto shrink-0 text-primary hover:text-primary/80"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Contenido del detalle de orden ───────────────────────────────────────────

interface OrderDetailContentProps {
  order: OrderOut;
}

function OrderDetailContent({ order }: OrderDetailContentProps) {
  const statusConfig = STATUS_CONFIG[order.status];
  const baseItem = order.items_snapshot.find((i) => i.kind === "service_base");
  const scheduledDate = baseItem?.meta?.scheduled_date;
  const scheduledTime = baseItem?.meta?.scheduled_time;
  const currentStatusIdx = STATUS_FLOW.indexOf(order.status);
  const addr = order.delivery_address_snapshot;
  const isActiveOrder = ["on_the_way", "in_service"].includes(order.status);

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Creado el {formatDate(order.created_at)}
          </p>
        </div>
        <span className={cn(
          "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shrink-0",
          statusConfig.bgColor, statusConfig.color
        )}>
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>

      {/* ── Panel de Tracking (estados on_the_way, in_service, done) ── */}
      {(["on_the_way", "in_service", "done"] as OrderStatus[]).includes(order.status) && (
        <TrackingPanel
          orderId={order.id}
          orderStatus={order.status}
          destination={addr ? {
            lat: addr.lat,
            lng: addr.lng,
            address_line: addr.address_line,
          } : null}
        />
      )}

      {/* ── Progreso completo (barra de 4 estados) ── */}
      {order.status !== "cancelled" && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Progreso del pedido
          </p>
          <div className="flex items-center gap-0">
            {STATUS_FLOW.map((status, idx) => {
              const conf = STATUS_CONFIG[status];
              const isPast = idx < currentStatusIdx;
              const isCurrentStep = idx === currentStatusIdx;
              return (
                <div key={status} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      "flex size-8 items-center justify-center rounded-full border-2 transition-all",
                      isPast && "border-primary bg-primary text-primary-foreground",
                      isCurrentStep && `border-current ${conf.color} bg-current/10`,
                      !isPast && !isCurrentStep && "border-border bg-muted text-muted-foreground"
                    )}>
                      {isPast ? <CheckCircle2 className="size-4" /> : conf.icon}
                    </div>
                    <span className={cn(
                      "hidden text-[10px] font-semibold sm:block text-center leading-tight max-w-16",
                      isCurrentStep ? conf.color : isPast ? "text-primary/70" : "text-muted-foreground"
                    )}>
                      {conf.label.split(" ").slice(0, 2).join(" ")}
                    </span>
                  </div>
                  {idx < STATUS_FLOW.length - 1 && (
                    <div className={cn(
                      "h-0.5 flex-1 mx-1 transition-all",
                      idx < currentStatusIdx ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {statusConfig.description}
          </p>
        </div>
      )}

      {/* ── Fecha del servicio ── */}
      {scheduledDate && (
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
          <CalendarDays className="size-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Fecha del servicio
            </p>
            <p className="text-sm font-semibold capitalize">
              {formatScheduledDate(scheduledDate, scheduledTime)}
            </p>
          </div>
        </div>
      )}

      {/* ── Dirección (solo si no está en panel de tracking) ── */}
      {addr && !isActiveOrder && (
        <div className="flex items-start gap-3 rounded-xl bg-muted/50 px-4 py-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Dirección de servicio
            </p>
            <p className="text-sm font-semibold">{addr.address_line}</p>
            {addr.reference && (
              <p className="text-xs text-muted-foreground">{addr.reference}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Items del pedido ── */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Resumen del servicio
          </p>
        </div>
        <div className="divide-y divide-border">
          {order.items_snapshot.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2">
                {item.kind === "service_base" && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    Principal
                  </span>
                )}
                {item.kind === "service_addon" && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    Adicional
                  </span>
                )}
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm font-semibold">
                S/ {(item.qty * item.unit_price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
          <span className="font-bold">Total</span>
          <span className="text-xl font-extrabold text-primary">
            S/ {order.total_snapshot.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await ordersService.detail(id);
      setOrder(data);
    } catch {
      setError("No se pudo cargar el pedido.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Polling ligero del estado de la orden cuando está activa (cada 15s)
  useEffect(() => {
    if (!order) return;
    const ACTIVE: OrderStatus[] = ["created", "on_the_way", "in_service"];
    if (!ACTIVE.includes(order.status)) return;

    const interval = setInterval(loadOrder, 15_000);
    return () => clearInterval(interval);
  }, [order?.status, loadOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/mis-pedidos"
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Volver a mis pedidos
      </Link>

      {loading && !order && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
          <button onClick={loadOrder} className="ml-auto flex items-center gap-1 underline text-xs">
            <RefreshCw className="size-3" /> Reintentar
          </button>
        </div>
      )}

      {order && !loading && (
        <OrderDetailContent order={order} />
      )}
    </div>
  );
}
