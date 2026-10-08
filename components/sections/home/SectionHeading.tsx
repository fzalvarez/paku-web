import type React from "react";
import { cn } from "@/lib/utils";

/** Encabezado común de las secciones del home: etiqueta con emoji, título y bajada. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  action,
}: {
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  action?: React.ReactNode;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 md:mb-14",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
      )}
    >
      <div className={cn("flex flex-col gap-3", centered ? "max-w-2xl items-center" : "max-w-xl items-start")}>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          {eyebrow}
        </span>
        <h2 id={id} className="text-3xl font-black tracking-tight text-primary md:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="text-base font-medium leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
