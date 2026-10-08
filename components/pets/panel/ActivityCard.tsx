import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ENERGY_LABEL, type ActivityInsight } from "@/lib/pet-insights";
import type { PetActivityLevel } from "@/types/pets";
import { PanelCard } from "./PanelCard";

const LEVELS: PetActivityLevel[] = ["low", "medium", "high"];

/** Tres segmentos: cuántos están llenos indica el nivel (además del texto). */
function EnergyMeter({ level }: { level: PetActivityLevel }) {
  const filled = LEVELS.indexOf(level) + 1;
  return (
    <span className="flex gap-1" aria-hidden="true">
      {LEVELS.map((l, i) => (
        <span key={l} className={cn("h-2 w-6 rounded-full", i < filled ? "bg-primary" : "bg-primary/15")} />
      ))}
    </span>
  );
}

export function ActivityCard({ activity }: { activity: ActivityInsight }) {
  const { breedEnergy, ownerLevel, suggestion } = activity;
  return (
    <PanelCard icon={Zap} title="Energía y actividad">
      <div className="flex flex-col gap-3">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {breedEnergy && (
            <div className="flex flex-col gap-1.5 rounded-2xl bg-muted/50 p-3">
              <dt className="text-xs font-semibold text-muted-foreground">Típica de su raza</dt>
              <dd className="flex items-center gap-2 text-sm font-bold text-foreground">
                <EnergyMeter level={breedEnergy} />
                {ENERGY_LABEL[breedEnergy]}
              </dd>
            </div>
          )}
          {ownerLevel && (
            <div className="flex flex-col gap-1.5 rounded-2xl bg-muted/50 p-3">
              <dt className="text-xs font-semibold text-muted-foreground">Según tu ficha</dt>
              <dd className="flex items-center gap-2 text-sm font-bold text-foreground">
                <EnergyMeter level={ownerLevel} />
                {ENERGY_LABEL[ownerLevel]}
              </dd>
            </div>
          )}
        </dl>
        {suggestion && <p className="text-sm text-foreground">🐾 {suggestion}</p>}
        {breedEnergy && ownerLevel && LEVELS.indexOf(ownerLevel) < LEVELS.indexOf(breedEnergy) && (
          <p className="text-sm text-muted-foreground">
            Su raza suele necesitar más actividad de la que indicaste: el juego y los paseos ayudan a evitar aburrimiento y
            sobrepeso.
          </p>
        )}
      </div>
    </PanelCard>
  );
}
