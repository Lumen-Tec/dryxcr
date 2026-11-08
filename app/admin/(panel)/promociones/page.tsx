"use client"

import { MegaphoneIcon, PencilIcon, PercentIcon, PlusIcon, TagIcon, Trash2Icon } from "lucide-react"
import { useLayoutEffect, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/status"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CATEGORIES, categoryLabel } from "@/lib/data/products"
import { formatCRC, formatDate, uid } from "@/lib/format"
import { isPromoLive, promoApplies } from "@/lib/pricing"
import { promotionsStore, useProducts, usePromotions } from "@/lib/store"
import { useNow } from "@/lib/store/hooks"
import type { Promotion, PromotionType } from "@/lib/types"

const TYPES: Record<PromotionType, string> = {
  banner: "Banner informativo",
  percent: "Descuento %",
  fixed: "Descuento en ₡",
}
const TARGETS = { all: "Toda la tienda", category: "Una categoría", product: "Productos específicos" }
const CAT_ITEMS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]))

const TYPE_ICON = { banner: MegaphoneIcon, percent: PercentIcon, fixed: TagIcon }

const empty = (): Promotion => ({
  id: "",
  title: "",
  subtitle: "",
  type: "percent",
  value: 10,
  target: { kind: "all", ids: [] },
  startsAt: new Date().toISOString(),
  endsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
  active: true,
})

export default function PromotionsPage() {
  const promos = usePromotions()
  const products = useProducts()
  const now = useNow()
  const [editing, setEditing] = useState<Promotion | null>(null)
  // Diálogos/paneles abiertos son estado transitorio: se cierran al salir de la página
  // (Next oculta la ruta en vez de desmontarla y, si no, reaparecerían abiertos al volver).
  useLayoutEffect(() => () => setEditing(null), [])

  const describeTarget = (p: Promotion) => {
    if (p.target.kind === "all") return "Toda la tienda"
    if (p.target.kind === "category") return p.target.ids.map((id) => categoryLabel(id as never)).join(", ")
    const names = products.filter((x) => p.target.ids.includes(x.id)).map((x) => x.name)
    return names.length > 2 ? `${names.slice(0, 2).join(", ")} y ${names.length - 2} más` : names.join(", ")
  }

  return (
    <>
      <PageHeader
        title="Promociones"
        description="Los descuentos (% o ₡) se aplican solos en la tienda. Los banners solo anuncian (ej. 3×₡35.000) y se cobran al confirmar por WhatsApp."
        actions={
          <Button onClick={() => setEditing(empty())}>
            <PlusIcon data-icon="inline-start" /> Nueva promoción
          </Button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-2">
        {promos.map((p) => {
          const live = isPromoLive(p, now)
          const expired = Date.parse(p.endsAt) < now
          const Icon = TYPE_ICON[p.type]
          const affected = p.type === "banner" ? null : products.filter((x) => promoApplies(p, x)).length
          return (
            <Card key={p.id} className={live ? "ring-brand/40" : undefined}>
              <CardContent className="flex gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted">
                  <Icon className="size-5 text-brand" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{p.title}</h3>
                    {live ? (
                      <Badge className="bg-success/15 text-success">● En vivo</Badge>
                    ) : expired ? (
                      <Badge variant="outline">Vencida</Badge>
                    ) : !p.active ? (
                      <Badge variant="outline">Pausada</Badge>
                    ) : (
                      <Badge variant="outline">Programada</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-pretty text-muted-foreground">{p.subtitle}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
                    <div>
                      <dt className="text-muted-foreground">Tipo</dt>
                      <dd>
                        {TYPES[p.type]}
                        {p.type === "percent" && ` · ${p.value}%`}
                        {p.type === "fixed" && ` · ${formatCRC(p.value ?? 0)}`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Aplica a</dt>
                      <dd className="truncate">
                        {describeTarget(p)}
                        {affected !== null && ` (${affected})`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Vigencia</dt>
                      <dd>
                        {formatDate(p.startsAt)} – {formatDate(p.endsAt)}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Switch
                    checked={p.active}
                    aria-label={p.active ? `Pausar ${p.title}` : `Activar ${p.title}`}
                    onCheckedChange={(v) => promotionsStore.set((all) => all.map((x) => (x.id === p.id ? { ...x, active: v } : x)))}
                  />
                  <div className="flex">
                    <Button variant="ghost" size="icon-sm" aria-label={`Editar ${p.title}`} onClick={() => setEditing(p)}>
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Eliminar ${p.title}`}
                      onClick={() => {
                        promotionsStore.set((all) => all.filter((x) => x.id !== p.id))
                        toast.success("Promoción eliminada", {
                          action: { label: "Deshacer", onClick: () => promotionsStore.set((all) => [...all, p]) },
                        })
                      }}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="gap-0 p-0 sm:max-w-lg">
          <ScrollArea viewportClassName="max-h-[90svh]">
            <div className="p-4 sm:p-6">
              {editing && <PromoForm key={editing.id || "new"} initial={editing} onClose={() => setEditing(null)} />}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

function PromoForm({ initial, onClose }: { initial: Promotion; onClose: () => void }) {
  const products = useProducts()
  const [p, setP] = useState(initial)
  const [touched, setTouched] = useState(false)
  const up = (patch: Partial<Promotion>) => setP((cur) => ({ ...cur, ...patch }))

  const errors = {
    title: p.title.trim().length < 3 ? "Poné un título corto y claro." : "",
    value:
      p.type === "percent" && !((p.value ?? 0) > 0 && (p.value ?? 0) < 100)
        ? "El porcentaje va de 1 a 99."
        : p.type === "fixed" && !((p.value ?? 0) > 0)
          ? "Ingresá un monto mayor a 0."
          : "",
    target: p.target.kind !== "all" && p.target.ids.length === 0 ? "Elegí a qué aplica." : "",
    dates: Date.parse(p.endsAt) <= Date.parse(p.startsAt) ? "La fecha final debe ser posterior al inicio." : "",
  }
  const firstError = Object.values(errors).find(Boolean)
  const toDate = (iso: string) => iso.slice(0, 10)

  function save() {
    setTouched(true)
    if (firstError) return
    const saved = { ...p, id: p.id || `promo-${uid()}`, title: p.title.trim(), subtitle: p.subtitle.trim() }
    promotionsStore.set((all) => (p.id ? all.map((x) => (x.id === p.id ? saved : x)) : [saved, ...all]))
    toast.success(p.id ? "Promoción actualizada" : "Promoción creada")
    onClose()
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
      noValidate
      className="grid gap-4"
    >
      <DialogHeader>
        <DialogTitle>{initial.id ? "Editar promoción" : "Nueva promoción"}</DialogTitle>
        <DialogDescription>Se muestra en la barra superior de la tienda mientras esté vigente.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-2">
        <Label htmlFor="pr-title">Título</Label>
        <Input id="pr-title" value={p.title} onChange={(e) => up({ title: e.target.value })} placeholder="Ej.: Black Friday DRYX" aria-invalid={touched && !!errors.title} />
        {touched && errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pr-sub">Detalle</Label>
        <Input id="pr-sub" value={p.subtitle} onChange={(e) => up({ subtitle: e.target.value })} placeholder="Ej.: 20 % en toda la ropa. Aplican restricciones." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="pr-type">Tipo</Label>
          <Select items={TYPES} value={p.type} onValueChange={(v) => v && up({ type: v as PromotionType })}>
            <SelectTrigger id="pr-type" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {p.type !== "banner" && (
          <div className="grid gap-2">
            <Label htmlFor="pr-value">{p.type === "percent" ? "Porcentaje (%)" : "Monto (₡)"}</Label>
            <Input id="pr-value" type="number" min={0} value={p.value ?? ""} onChange={(e) => up({ value: Number(e.target.value) })} aria-invalid={touched && !!errors.value} />
            {touched && errors.value && <p className="text-xs text-destructive">{errors.value}</p>}
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="pr-target">Aplica a</Label>
        <Select items={TARGETS} value={p.target.kind} onValueChange={(v) => v && up({ target: { kind: v as Promotion["target"]["kind"], ids: [] } })}>
          <SelectTrigger id="pr-target" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(TARGETS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        {p.target.kind === "category" && (
          <Select items={CAT_ITEMS} value={p.target.ids[0] ?? null} onValueChange={(v) => v && up({ target: { kind: "category", ids: [v] } })}>
            <SelectTrigger className="w-full" aria-label="Categoría"><SelectValue placeholder="Elegí una categoría" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {p.target.kind === "product" && (
          <ScrollArea className="rounded-lg border border-border" viewportClassName="max-h-48 p-2">
            {products.map((x) => {
              const on = p.target.ids.includes(x.id)
              return (
                <label key={x.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => up({ target: { kind: "product", ids: on ? p.target.ids.filter((i) => i !== x.id) : [...p.target.ids, x.id] } })}
                    className="accent-[var(--brand)]"
                  />
                  <span className="truncate">{x.name}</span>
                </label>
              )
            })}
          </ScrollArea>
        )}
        {touched && errors.target && <p className="text-xs text-destructive">{errors.target}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="pr-start">Desde</Label>
          <Input id="pr-start" type="date" value={toDate(p.startsAt)} onChange={(e) => e.target.value && up({ startsAt: new Date(`${e.target.value}T00:00:00`).toISOString() })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pr-end">Hasta</Label>
          <Input id="pr-end" type="date" value={toDate(p.endsAt)} onChange={(e) => e.target.value && up({ endsAt: new Date(`${e.target.value}T23:59:59`).toISOString() })} aria-invalid={touched && !!errors.dates} />
        </div>
      </div>
      {touched && errors.dates && <p className="text-xs text-destructive">{errors.dates}</p>}

      <Label className="flex items-center justify-between font-normal">
        Activa
        <Switch checked={p.active} onCheckedChange={(v) => up({ active: v })} />
      </Label>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">{initial.id ? "Guardar" : "Crear promoción"}</Button>
      </DialogFooter>
    </form>
  )
}
