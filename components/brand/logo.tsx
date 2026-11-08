import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn("font-sans text-2xl leading-none font-black tracking-tight select-none", className)}
      aria-label="DRYX"
    >
      DRY<span className="text-brand">X</span>
    </span>
  )
}
