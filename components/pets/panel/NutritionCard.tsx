import { UtensilsCrossed } from "lucide-react";
import type { NutritionInsight } from "@/lib/pet-insights";
import { PanelCard } from "./PanelCard";

export function NutritionCard({ nutrition }: { nutrition: NutritionInsight }) {
  return (
    <PanelCard icon={UtensilsCrossed} title="Alimentación orientativa">
      <div className="flex flex-col gap-3">
        <p className="text-lg font-extrabold text-foreground">🍽️ {nutrition.foodType}</p>
        {nutrition.tips.length > 0 && (
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            {nutrition.tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">La marca y la cantidad las define tu veterinario.</p>
      </div>
    </PanelCard>
  );
}
