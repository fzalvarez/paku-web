import type React from "react";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Aviso de error o éxito dentro de una página o formulario; `onRetry` añade "Reintentar". */
export function InlineAlert({
  type = "error",
  children,
  onRetry,
  className,
}: {
  type?: "error" | "success";
  children: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}) {
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium",
        type === "success"
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-destructive/20 bg-destructive/10 text-destructive",
        className,
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1">{children}</span>
      {onRetry && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onRetry}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <RefreshCw className="size-3.5" /> Reintentar
        </Button>
      )}
    </div>
  );
}
