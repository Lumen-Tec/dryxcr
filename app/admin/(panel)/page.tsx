"use client"

import { AlertTriangleIcon, ArrowRightIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { SalesChart, type DayPoint } from "@/components/admin/sales-chart"
import { PageHeader, StatusBadge } from "@/components/admin/status"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCRC, formatDate, formatDateTime } from "@/lib/format"
import { LOW_STOCK } from "@/lib/pricing"
import { useOrders, useProducts } from "@/lib/store"
import { useNow } from "@/lib/store/hooks"

const DAYS = 14

export default function DashboardPage() {
  const orders = useOrders()
  const products = useProducts()
  const now = useNow()

  const valid = orders.filter((o) => o.status !== "cancelado")
  const since30 = now - 30 * 86400000
  const last30 = valid.filter((o) => Date.parse(o.createdAt) >= since30)
  const revenue = last30.reduce((s, o) => s + o.total, 0)
  const units = last30.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0)
  const pending = orders.filter((o) => o.status === "nuevo" || o.status === "pagado")

  // Serie diaria de los últimos 14 días
  const series: DayPoint[] = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(now - (DAYS - 1 - i) * 86400000)
    const key = d.toISOString().slice(0, 10)
    const day = valid.filter((o) => o.createdAt.slice(0, 10) === key)
    return { key, label: formatDate(d.toISOString()).replace(/ \d{4}$/, ""), total: day.reduce((s, o) => s + o.total, 0), orders: day.length }
  })

  // Top productos por unidades (30 días)
  const tally = new Map<string, { name: string; qty: number; revenue: number }>()
  for (const o of last30)
    for (const it of o.items) {
      const cur = tally.get(it.productId) ?? { name: it.name, qty: 0, revenue: 0 }
      cur.qty += it.qty
      cur.revenue += it.qty * it.unitPrice
      tally.set(it.productId, cur)
    }
  const top = [...tally.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 5)

  const lowStock = products
    .flatMap((p) => p.variants.filter((v) => v.stock <= LOW_STOCK).map((v) => ({ p, v })))
    .sort((a, b) => a.v.stock - b.v.stock)

  const kpis = [
    { label: "Ventas · 30 días", value: formatCRC(revenue) },
    { label: "Pedidos · 30 días", value: String(last30.length) },
    { label: "Ticket promedio", value: formatCRC(last30.length ? revenue / last30.length : 0) },
    { label: "Unidades vendidas", value: String(units) },
  ]

  return (
    <>
      <PageHeader title="Hola, DRYX" description="Resumen de los últimos 30 días. Los pedidos se registran manualmente desde WhatsApp y tienda." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent>
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums sm:text-3xl">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-sans font-semibold">Ventas por día</CardTitle>
            <CardDescription>Últimos {DAYS} días · excluye cancelados</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-sans font-semibold">Por atender</CardTitle>
            <CardDescription>{pending.length} pedidos nuevos o pagados sin enviar</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin/pedidos" />}>
                Ver todos <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todo al día. 🙌</p>
            ) : (
              <ul className="divide-y divide-border">
                {pending.slice(0, 6).map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        #{o.number} · {o.customer}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="tabular-nums">{formatCRC(o.total)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-sans font-semibold">Más vendidos</CardTitle>
            <CardDescription>Por unidades, últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {top.map(([id, t], i) => {
                const p = products.find((x) => x.id === id)
                return (
                  <li key={id} className="flex items-center gap-3 text-sm">
                    <span className="w-4 text-muted-foreground tabular-nums">{i + 1}</span>
                    <div className="relative size-10 shrink-0 overflow-hidden rounded bg-muted">
                      {p && <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" style={{ objectPosition: p.imagePosition }} />}
                    </div>
                    <span className="min-w-0 flex-1 truncate">{t.name}</span>
                    <span className="text-muted-foreground tabular-nums">{t.qty} u.</span>
                    <span className="w-24 text-right tabular-nums">{formatCRC(t.revenue)}</span>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-sans font-semibold">
              <AlertTriangleIcon className="size-4 text-warning" /> Stock bajo
            </CardTitle>
            <CardDescription>
              {lowStock.length} variantes con {LOW_STOCK} unidades o menos
            </CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin/inventario?filtro=bajo" />}>
                Inventario <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {lowStock.slice(0, 6).map(({ p, v }) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate">
                    {p.name} <span className="text-muted-foreground">· {v.color} · {v.size}</span>
                  </span>
                  <span className={v.stock === 0 ? "font-medium text-destructive" : "text-warning"}>
                    {v.stock === 0 ? "Agotado" : `${v.stock} u.`}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
