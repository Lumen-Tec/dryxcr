import { CheckCheckIcon, CircleDotIcon, CircleXIcon, TruckIcon, WalletIcon } from "lucide-react"
import type { OrderStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export const ORDER_STATUS: Record<OrderStatus, { label: string; Icon: typeof CircleDotIcon; className: string }> = {
  nuevo: { label: "Nuevo", Icon: CircleDotIcon, className: "border-brand/50 bg-brand/15 text-foreground" },
  pagado: { label: "Pagado", Icon: WalletIcon, className: "border-warning/40 bg-warning/10 text-foreground" },
  enviado: { label: "Enviado", Icon: TruckIcon, className: "border-sky-400/40 bg-sky-400/10 text-foreground" },
  entregado: { label: "Entregado", Icon: CheckCheckIcon, className: "border-success/40 bg-success/10 text-foreground" },
  cancelado: { label: "Cancelado", Icon: CircleXIcon, className: "border-border bg-muted text-muted-foreground" },
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, Icon, className } = ORDER_STATUS[status]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", className)}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  )
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-4xl sm:text-5xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
