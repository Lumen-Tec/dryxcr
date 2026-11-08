import { formatCRC } from "@/lib/format"
import type { Pricing } from "@/lib/pricing"
import { cn } from "@/lib/utils"

export function Price({ pricing, className, size = "md" }: { pricing: Pricing; className?: string; size?: "md" | "lg" }) {
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 tabular-nums", className)}>
      <span className={cn("font-semibold", size === "lg" ? "text-3xl" : "text-base", pricing.compareAt && "text-brand")}>
        {formatCRC(pricing.price)}
      </span>
      {pricing.compareAt && (
        <span className={cn("text-muted-foreground line-through", size === "lg" ? "text-lg" : "text-sm")}>
          <span className="sr-only">Antes </span>
          {formatCRC(pricing.compareAt)}
        </span>
      )}
    </div>
  )
}
