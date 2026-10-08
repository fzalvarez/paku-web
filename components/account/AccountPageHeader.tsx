import type React from "react";

/**
 * Encabezado común de las páginas de /account: mismo tamaño, peso y color de
 * título en todas las secciones. `action` va a la derecha (p. ej. "Agregar").
 */
export function AccountPageHeader({
  title,
  description,
  action,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-black tracking-tight text-primary md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground md:text-base">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
