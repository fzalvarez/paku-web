"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDay, type WeightPoint } from "@/lib/pet-insights";

const HEIGHT = 200;
const PAD = { top: 16, right: 56, bottom: 28, left: 40 };

/** Ticks "limpios" para el eje Y (pasos de 0.5, 1, 2, 5… kg). */
function niceTicks(min: number, max: number, count = 4): number[] {
  const span = Math.max(max - min, 1);
  const raw = span / count;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(2)));
  return ticks;
}

const kg = (v: number) => `${v.toLocaleString("es-PE", { maximumFractionDigits: 1 })} kg`;

/**
 * Evolución del peso: una sola serie (sin leyenda; el título la nombra), línea
 * de 2px con relleno suave, puntos con anillo del color de fondo, último valor
 * etiquetado, crosshair + tooltip al punto más cercano y tabla equivalente.
 */
export function WeightChart({ points }: { points: WeightPoint[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geo = useMemo(() => {
    const times = points.map((p) => Date.parse(p.day));
    const t0 = Math.min(...times);
    const t1 = Math.max(...times);
    const values = points.map((p) => p.kg);
    const ticks = niceTicks(Math.min(...values), Math.max(...values));
    const yMin = ticks[0];
    const yMax = ticks[ticks.length - 1];
    const plotW = width - PAD.left - PAD.right;
    const plotH = HEIGHT - PAD.top - PAD.bottom;
    const x = (t: number) => PAD.left + (t1 === t0 ? plotW / 2 : ((t - t0) / (t1 - t0)) * plotW);
    const y = (v: number) => PAD.top + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH;
    const xy = points.map((p, i) => ({ ...p, x: x(times[i]), y: y(p.kg) }));
    const line = xy.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
    const baseline = PAD.top + plotH;
    const area = `${line} L${xy[xy.length - 1].x},${baseline} L${xy[0].x},${baseline} Z`;
    return { ticks, y, xy, line, area, baseline };
  }, [points, width]);

  function onPointerMove(e: React.PointerEvent<SVGRectElement>) {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const px = e.clientX - box.left;
    let best = 0;
    geo.xy.forEach((p, i) => {
      if (Math.abs(p.x - px) < Math.abs(geo.xy[best].x - px)) best = i;
    });
    setHover(best);
  }

  const last = geo.xy[geo.xy.length - 1];
  const active = hover != null ? geo.xy[hover] : null;
  const first = points[0];
  const change = last.kg - first.kg;

  return (
    <div className="flex flex-col gap-3">
      <div ref={wrapRef} className="relative w-full">
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`Peso de ${formatDay(first.day)} a ${formatDay(last.day)}: de ${kg(first.kg)} a ${kg(last.kg)}`}
          className="block overflow-visible"
        >
          {/* Rejilla y eje Y (recesivos) */}
          {geo.ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={geo.y(t)} y2={geo.y(t)} className="stroke-border" strokeWidth={1} />
              <text x={PAD.left - 8} y={geo.y(t)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px] tabular-nums">
                {t.toLocaleString("es-PE")}
              </text>
            </g>
          ))}
          {/* Fechas extremas en el eje X */}
          <text x={geo.xy[0].x} y={HEIGHT - 6} textAnchor="start" className="fill-muted-foreground text-[11px]">
            {formatDay(first.day, { day: "numeric", month: "short", year: "2-digit" })}
          </text>
          {geo.xy.length > 1 && (
            <text x={last.x} y={HEIGHT - 6} textAnchor="end" className="fill-muted-foreground text-[11px]">
              {formatDay(last.day, { day: "numeric", month: "short", year: "2-digit" })}
            </text>
          )}

          {/* Serie */}
          <g className="text-primary">
            <path d={geo.area} fill="currentColor" fillOpacity={0.1} />
            <path d={geo.line} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {active && (
              <line x1={active.x} x2={active.x} y1={PAD.top} y2={geo.baseline} className="stroke-muted-foreground/50" strokeWidth={1} />
            )}
            {geo.xy.map((p, i) => (
              <circle
                key={p.day + i}
                cx={p.x}
                cy={p.y}
                r={hover === i ? 6 : 4}
                fill="currentColor"
                className="stroke-card"
                strokeWidth={2}
              />
            ))}
          </g>

          {/* Etiqueta del último valor (texto en tinta, no en el color de la serie) */}
          <text x={last.x + 10} y={last.y} dy="0.32em" className="fill-foreground text-xs font-bold tabular-nums">
            {kg(last.kg)}
          </text>

          {/* Zona de captura: el crosshair busca la fecha más cercana */}
          <rect
            x={PAD.left}
            y={0}
            width={width - PAD.left - PAD.right}
            height={HEIGHT}
            fill="transparent"
            onPointerMove={onPointerMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        {active && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md"
            style={{ left: active.x, top: active.y - 10 }}
          >
            <p className="font-bold tabular-nums text-foreground">{kg(active.kg)}</p>
            <p className="text-muted-foreground">{formatDay(active.day, { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        )}
      </div>

      {points.length > 1 && (
        <p className="text-sm text-muted-foreground">
          {change === 0
            ? "Mantiene su peso desde el primer registro."
            : `${change > 0 ? "Subió" : "Bajó"} ${kg(Math.abs(change))} desde el ${formatDay(first.day, { day: "numeric", month: "long", year: "numeric" })}.`}
        </p>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer font-semibold text-primary">Ver como tabla</summary>
        <table className="mt-2 w-full max-w-sm text-left">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="py-1.5 font-semibold">Fecha</th>
              <th className="py-1.5 text-right font-semibold">Peso</th>
            </tr>
          </thead>
          <tbody>
            {[...points].reverse().map((p, i) => (
              <tr key={p.day + i} className="border-b border-border/50">
                <td className="py-1.5">{formatDay(p.day, { day: "numeric", month: "long", year: "numeric" })}</td>
                <td className="py-1.5 text-right tabular-nums">{kg(p.kg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
