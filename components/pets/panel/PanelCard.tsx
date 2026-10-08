import type React from "react";
import { cn } from "@/lib/utils";

/** Contenedor común de los bloques del panel de la mascota. */
export function PanelCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-6", className)}>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
