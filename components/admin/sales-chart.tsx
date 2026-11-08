"use client"

import { useState } from "react"
import { formatCRC } from "@/lib/format"

export interface DayPoint {
  key: string
  label: string
  total: number
  orders: number
}

/** Barras de ventas por día (una sola serie: sin leyenda, el título la nombra). */
export function SalesChart({ data }: { data: DayPoint[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.total))
  const nice = Math.ceil(max / 50000) * 50000
  const ticks = [0, nice / 2, nice]

  return (
    <figure className="w-full">
      <div className="relative flex h-56 gap-3">
        {/* Eje Y recesivo */}
        <div className="flex w-14 shrink-0 flex-col-reverse justify-between pb-6 text-right text-[0.7rem] text-muted-foreground tabular-nums">
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0">
              {t === 0 ? "0" : `₡${t / 1000}k`}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between" aria-hidden>
            {ticks.map((t) => (
              <div key={t} className="border-t border-border/60" />
            ))}
          </div>
          <div className="absolute inset-x-0 top-0 bottom-6 flex items-end gap-0.5" role="list">
            {data.map((d, i) => (
              <div
                key={d.key}
                role="listitem"
                className="group relative flex h-full flex-1 items-end"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${d.label}: ${formatCRC(d.total)} en ${d.orders} pedidos`}
              >
                <div
                  className="w-full rounded-t-[4px] bg-[#e5342f] transition-opacity"
                  style={{ height: `${(d.total / nice) * 100}%`, opacity: hover === null || hover === i ? 1 : 0.45 }}
                />
                {hover === i && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md border border-border bg-popover px-3 py-2 text-xs whitespace-nowrap shadow-lg">
                    <p className="font-medium">{d.label}</p>
                    <p className="text-muted-foreground tabular-nums">
                      {formatCRC(d.total)} · {d.orders} {d.orders === 1 ? "pedido" : "pedidos"}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex gap-0.5 text-[0.65rem] text-muted-foreground" aria-hidden>
            {data.map((d, i) => (
              <span key={d.key} className="flex-1 text-center">
                {i % 2 === 0 ? d.label.split(" ")[0] : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="cursor-pointer select-none">Ver como tabla</summary>
        <table className="mt-2 w-full tabular-nums">
          <thead>
            <tr className="text-left">
              <th className="py-1 font-medium">Día</th>
              <th className="py-1 text-right font-medium">Pedidos</th>
              <th className="py-1 text-right font-medium">Ventas</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.key} className="border-t border-border">
                <td className="py-1">{d.label}</td>
                <td className="py-1 text-right">{d.orders}</td>
                <td className="py-1 text-right text-foreground">{formatCRC(d.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
