import type React from "react";

/** Estado vacío común de las listas de /account (mascotas, direcciones, tarjetas, pedidos). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-linear-to-br from-primary/10 via-secondary/5 to-tertiary/10">
        <Icon className="size-10 text-primary/50" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-lg font-extrabold tracking-tight text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
