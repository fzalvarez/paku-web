import Link from "next/link";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeightAssessment, WeightPoint } from "@/lib/pet-insights";
import { PanelCard } from "./PanelCard";
import { WeightChart } from "./WeightChart";

const kg = (v: number) => `${v.toLocaleString("es-PE", { maximumFractionDigits: 1 })} kg`;

const POSITION_TEXT = {
  below: { label: "Por debajo de lo habitual", className: "text-amber-700" },
  within: { label: "Dentro de lo habitual", className: "text-green-700" },
  above: { label: "Por encima de lo habitual", className: "text-amber-700" },
} as const;

/** Barra con el rango habitual de su raza y la posición de su peso actual. */
function BreedRange({ assessment }: { assessment: WeightAssessment }) {
  const [min, max] = assessment.range;
  // La escala se abre un 30% a cada lado del rango para que se vea dónde cae
  const pad = (max - min) * 0.3 || 1;
  const lo = Math.max(0, min - pad);
  const hi = max + pad;
  const pct = (v: number) => `${Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100))}%`;
  const text = POSITION_TEXT[assessment.position];

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-muted/50 p-4">
      <p className="text-sm">
        <span className={cn("font-bold", text.className)}>{text.label}</span>
        <span className="text-muted-foreground"> para su raza ({kg(min)} – {kg(max)}).</span>
      </p>
      <div className="relative h-2.5 rounded-full bg-border" role="img" aria-label={`Rango habitual ${kg(min)} a ${kg(max)}; su peso: ${kg(assessment.kg)}`}>
        <div className="absolute inset-y-0 rounded-full bg-primary/25" style={{ left: pct(min), right: `calc(100% - ${pct(max)})` }} />
        <div
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary"
          style={{ left: pct(assessment.kg) }}
        />
      </div>
      {assessment.note && <p className="text-xs text-muted-foreground">{assessment.note}</p>}
    </div>
  );
}

export function WeightCard({
  points,
  currentKg,
  assessment,
  fichaHref,
}: {
  points: WeightPoint[];
  currentKg: number | null;
  assessment: WeightAssessment | null;
  fichaHref: string;
}) {
  return (
    <PanelCard icon={Scale} title="Su peso">
      <div className="flex flex-col gap-4">
        {points.length > 1 ? (
          <WeightChart points={points} />
        ) : currentKg != null ? (
          <div className="flex flex-col gap-1">
            <p className="text-3xl font-black tracking-tight text-foreground">{kg(currentKg)}</p>
            <p className="text-sm text-muted-foreground">
              Registra su peso de vez en cuando desde su ficha y aquí verás cómo evoluciona.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Registra su peso desde su{" "}
            <Link href={fichaHref} className="font-semibold text-primary underline">ficha</Link> para seguir su evolución.
          </p>
        )}
        {assessment && <BreedRange assessment={assessment} />}
      </div>
    </PanelCard>
  );
}
