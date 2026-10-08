import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Etiquetas tipo píldora. `size="sm"` (por defecto) es la etiqueta corta en
 * mayúsculas (Predeterminada, Perro, Vacunas al día); `size="md"` es el chip de
 * estado de pedido/pago, que recibe sus colores de `lib/labels.ts` por className.
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-transparent whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
        success: "bg-green-50 text-green-700",
        info: "bg-blue-50 text-blue-700",
        muted: "bg-muted text-muted-foreground",
        outline: "border-border bg-background text-muted-foreground",
      },
      size: {
        sm: "px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase",
        md: "px-2.5 py-0.5 text-xs font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
