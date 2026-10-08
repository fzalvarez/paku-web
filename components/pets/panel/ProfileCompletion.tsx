import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { MissingField } from "@/lib/pet-insights";

export function ProfileCompletion({ petName, missing, fichaHref }: { petName: string; missing: MissingField[]; fichaHref: string }) {
  if (missing.length === 0) return null;
  return (
    <section className="rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-5 sm:p-6">
      <h2 className="mb-1 text-lg font-extrabold tracking-tight text-foreground">Completa su perfil ✨</h2>
      <p className="mb-4 text-sm text-muted-foreground">Con estos datos el panel te dice más sobre {petName}:</p>
      <ul className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {missing.map((m) => (
          <li key={m.field} className="text-sm">
            <span className="font-bold text-foreground">{m.label}</span>
            <span className="text-muted-foreground"> → {m.unlocks}</span>
          </li>
        ))}
      </ul>
      <Button asChild variant="outline" className="rounded-full">
        <Link href={fichaHref}>Completar en su ficha</Link>
      </Button>
    </section>
  );
}
