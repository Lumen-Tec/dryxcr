"use client"

import { PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { useLayoutEffect, useState } from "react"
import { toast } from "sonner"
import { WhatsAppIcon } from "@/components/brand/social-icons"
import { ProductPicker } from "@/components/admin/product-picker"
import { ORDER_STATUS, PageHeader, StatusBadge } from "@/components/admin/status"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PROVINCES } from "@/components/shop/cart-sheet"
import { formatCRC, formatDateTime, uid } from "@/lib/format"
import { ordersStore, productsStore, useOrders, useProducts } from "@/lib/store"
import { usePricer } from "@/lib/store/hooks"
import type { Order, OrderItem, OrderStatus } from "@/lib/types"

const STATUS_ITEMS = Object.fromEntries(Object.entries(ORDER_STATUS).map(([k, v]) => [k, v.label])) as Record<OrderStatus, string>
const CHANNELS = { whatsapp: "WhatsApp", tienda: "Tienda física", instagram: "Instagram DM" }
const DELIVERY = { pickup: "Retiro en tienda", shipping: "Envío Correos de CR" }
const PROV_ITEMS = Object.fromEntries(PROVINCES.map((p) => [p, p]))

export default function OrdersPage() {
  const orders = useOrders()
  const [tab, setTab] = useState<"todos" | OrderStatus>("todos")
  const [q, setQ] = useState("")
  const [open, setOpen] = useState<Order | null>(null)
  const [creating, setCreating] = useState(false)
  // Diálogos/paneles abiertos son estado transitorio: se cierran al salir de la página
  // (Next oculta la ruta en vez de desmontarla y, si no, reaparecerían abiertos al volver).
  useLayoutEffect(
    () => () => {
      setOpen(null)
      setCreating(false)
    },
    [],
  )

  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const rows = sorted.filter(
    (o) =>
      (tab === "todos" || o.status === tab) &&
      (!q || `${o.number} ${o.customer} ${o.phone}`.toLowerCase().includes(q.toLowerCase())),
  )
  const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length
  const current = open ? orders.find((o) => o.id === open.id) ?? null : null

  const setStatus = (id: string, status: OrderStatus) => {
    ordersStore.set((all) => all.map((o) => (o.id === id ? { ...o, status } : o)))
    toast.success(`Pedido marcado como ${ORDER_STATUS[status].label.toLowerCase()}`)
  }

  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Registrá aquí los pedidos que llegan por WhatsApp, DM o en tienda, y seguí su estado."
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" /> Registrar pedido
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <ScrollArea scrollbars="horizontal" className="max-w-full">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => (
              <TabsTrigger key={s} value={s}>
                {ORDER_STATUS[s].label} <span className="text-muted-foreground tabular-nums">{count(s)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        </ScrollArea>
        <div className="relative w-full sm:w-64">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="#, cliente o teléfono" className="pl-9" aria-label="Buscar pedidos" />
        </div>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Canal</TableHead>
              <TableHead className="hidden lg:table-cell">Entrega</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="pr-4 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((o) => (
              <TableRow key={o.id} className="cursor-pointer" onClick={() => setOpen(o)}>
                <TableCell className="pl-4">
                  <button type="button" className="text-left font-medium hover:text-brand" onClick={() => setOpen(o)}>
                    #{o.number}
                  </button>
                  <span className="block text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</span>
                </TableCell>
                <TableCell>
                  {o.customer}
                  <span className="block text-xs text-muted-foreground">{o.phone}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell">{CHANNELS[o.channel]}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {o.delivery === "pickup" ? "Retiro" : `${o.canton}, ${o.province}`}
                </TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
                <TableCell className="pr-4 text-right tabular-nums">{formatCRC(o.total)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No hay pedidos con este filtro.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!current} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full gap-0 sm:max-w-md">
          {current && (
            <ScrollArea className="min-h-0 flex-1">
              <SheetHeader className="border-b border-border">
                <SheetTitle className="font-display text-3xl">Pedido #{current.number}</SheetTitle>
                <SheetDescription>
                  {formatDateTime(current.createdAt)} · {CHANNELS[current.channel]}
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 px-4 pb-6">
                <div className="grid gap-2">
                  <Label htmlFor="od-status">Estado</Label>
                  <Select items={STATUS_ITEMS} value={current.status} onValueChange={(v) => v && setStatus(current.id, v as OrderStatus)}>
                    <SelectTrigger id="od-status" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_ITEMS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-xs text-muted-foreground">Cliente</dt><dd>{current.customer}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Teléfono</dt><dd>{current.phone}</dd></div>
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">Entrega</dt>
                    <dd>{current.delivery === "pickup" ? "Retiro en tienda" : `Envío a ${current.canton}, ${current.province}`}</dd>
                  </div>
                  {current.notes && <div className="col-span-2"><dt className="text-xs text-muted-foreground">Notas</dt><dd>{current.notes}</dd></div>}
                </dl>
                <ul className="divide-y divide-border rounded-lg border border-border text-sm">
                  {current.items.map((it, i) => (
                    <li key={i} className="flex justify-between gap-3 p-3">
                      <span>
                        {it.qty}× {it.name}
                        <span className="block text-xs text-muted-foreground">{it.variantLabel}</span>
                      </span>
                      <span className="tabular-nums">{formatCRC(it.qty * it.unitPrice)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between p-3 font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatCRC(current.total)}</span>
                  </li>
                </ul>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={
                    <a
                      href={`https://wa.me/506${current.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`¡Hola ${current.customer.split(" ")[0]}! Te escribimos de DRYX sobre tu pedido #${current.number}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <WhatsAppIcon className="size-4 text-[#25D366]" data-icon="inline-start" /> Escribirle al cliente
                </Button>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="gap-0 p-0 sm:max-w-2xl">
          <ScrollArea viewportClassName="max-h-[90svh]">
            <div className="p-4 sm:p-6">
              {creating && <NewOrderForm onClose={() => setCreating(false)} nextNumber={Math.max(1000, ...orders.map((o) => o.number)) + 1} />}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

function NewOrderForm({ onClose, nextNumber }: { onClose: () => void; nextNumber: number }) {
  const products = useProducts()
  const pricer = usePricer()
  const [customer, setCustomer] = useState("")
  const [phone, setPhone] = useState("")
  const [channel, setChannel] = useState<Order["channel"]>("whatsapp")
  const [delivery, setDelivery] = useState<Order["delivery"]>("pickup")
  const [province, setProvince] = useState<string | null>(null)
  const [canton, setCanton] = useState("")
  const [status, setStatus] = useState<OrderStatus>("nuevo")
  const [notes, setNotes] = useState("")
  const [discount, setDiscount] = useState(true)
  const [lines, setLines] = useState<(OrderItem & { variantId: string })[]>([])
  const [pick, setPick] = useState<{ productId: string | null; variantId: string | null; qty: number }>({ productId: null, variantId: null, qty: 1 })
  const [touched, setTouched] = useState(false)

  const product = products.find((p) => p.id === pick.productId)
  const VARIANT_ITEMS = Object.fromEntries((product?.variants ?? []).map((v) => [v.id, `${v.color} · ${v.size} (${v.stock} disp.)`]))
  const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)

  const errors = {
    customer: customer.trim().length < 2 ? "Nombre del cliente requerido." : "",
    phone: phone.replace(/\D/g, "").length !== 8 ? "Teléfono de 8 dígitos (ej. 8812-4471)." : "",
    lines: lines.length === 0 ? "Agregá al menos un producto." : "",
    shipping: delivery === "shipping" && (!province || canton.trim().length < 2) ? "Indicá provincia y cantón." : "",
  }
  const firstError = Object.values(errors).find(Boolean)

  function addLine() {
    if (!product) return
    const v = product.variants.find((x) => x.id === pick.variantId)
    if (!v) return
    setLines((ls) => [
      ...ls,
      { productId: product.id, variantId: v.id, name: product.name, variantLabel: `${v.color} · ${v.size}`, qty: pick.qty, unitPrice: pricer(product).price },
    ])
    setPick({ productId: null, variantId: null, qty: 1 })
  }

  function save() {
    setTouched(true)
    if (firstError) return
    const order: Order = {
      id: `o-${uid()}`,
      number: nextNumber,
      customer: customer.trim(),
      phone: phone.trim(),
      channel,
      delivery,
      province: delivery === "shipping" ? (province ?? undefined) : undefined,
      canton: delivery === "shipping" ? canton.trim() : undefined,
      items: lines.map((l) => ({ productId: l.productId, name: l.name, variantLabel: l.variantLabel, qty: l.qty, unitPrice: l.unitPrice })),
      total,
      status,
      createdAt: new Date().toISOString(),
      notes: notes.trim() || undefined,
    }
    ordersStore.set((all) => [order, ...all])
    if (discount && status !== "cancelado") {
      productsStore.set((all) =>
        all.map((p) => ({
          ...p,
          variants: p.variants.map((v) => {
            const used = lines.filter((l) => l.variantId === v.id).reduce((s, l) => s + l.qty, 0)
            return used ? { ...v, stock: Math.max(0, v.stock - used) } : v
          }),
        })),
      )
    }
    toast.success(`Pedido #${order.number} registrado`, { description: discount ? "Inventario actualizado." : undefined })
    onClose()
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save() }} noValidate className="grid gap-5">
      <DialogHeader>
        <DialogTitle>Registrar pedido #{nextNumber}</DialogTitle>
        <DialogDescription>Copiá los datos del chat de WhatsApp, del DM o de la venta en tienda.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2 sm:col-span-1">
          <Label htmlFor="no-name">Cliente</Label>
          <Input id="no-name" value={customer} onChange={(e) => setCustomer(e.target.value)} aria-invalid={touched && !!errors.customer} />
          {touched && errors.customer && <p className="text-xs text-destructive">{errors.customer}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="no-phone">Teléfono</Label>
          <Input id="no-phone" inputMode="tel" placeholder="8812-4471" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={touched && !!errors.phone} />
          {touched && errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="no-channel">Canal</Label>
          <Select items={CHANNELS} value={channel} onValueChange={(v) => v && setChannel(v as Order["channel"])}>
            <SelectTrigger id="no-channel" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(CHANNELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <fieldset className="grid gap-3 rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-medium">Productos</legend>
        {lines.length > 0 && (
          <ul className="divide-y divide-border text-sm">
            {lines.map((l, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0">
                  {l.qty}× {l.name} <span className="text-muted-foreground">· {l.variantLabel}</span>
                </span>
                <span className="flex items-center gap-2 tabular-nums">
                  {formatCRC(l.qty * l.unitPrice)}
                  <Button type="button" variant="ghost" size="icon-xs" aria-label="Quitar línea" onClick={() => setLines(lines.filter((_, j) => j !== i))}>
                    <Trash2Icon />
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_4.5rem_auto]">
          <ProductPicker
            products={products}
            value={pick.productId}
            priceOf={(p) => pricer(p).price}
            onChange={(id) => {
              const p = products.find((x) => x.id === id)
              // Si tiene una sola variante con stock (ej. gorras "Ajustable"), se preselecciona.
              const inStock = p?.variants.filter((v) => v.stock > 0) ?? []
              setPick({ productId: id, variantId: inStock.length === 1 ? inStock[0].id : null, qty: 1 })
            }}
          />
          <Select items={VARIANT_ITEMS} value={pick.variantId} onValueChange={(v) => setPick((s) => ({ ...s, variantId: v }))} disabled={!product}>
            <SelectTrigger className="w-full" aria-label="Variante"><SelectValue placeholder="Color · talla" /></SelectTrigger>
            <SelectContent>
              {(product?.variants ?? []).map((v) => (
                <SelectItem key={v.id} value={v.id} disabled={v.stock === 0}>{VARIANT_ITEMS[v.id]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="number" min={1} aria-label="Cantidad" value={pick.qty} onChange={(e) => setPick((s) => ({ ...s, qty: Math.max(1, Number(e.target.value)) }))} />
          <Button type="button" variant="secondary" onClick={addLine} disabled={!pick.variantId}>Agregar</Button>
        </div>
        {touched && errors.lines && <p className="text-xs text-destructive">{errors.lines}</p>}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="no-del">Entrega</Label>
          <Select items={DELIVERY} value={delivery} onValueChange={(v) => v && setDelivery(v as Order["delivery"])}>
            <SelectTrigger id="no-del" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(DELIVERY).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {delivery === "shipping" && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="no-prov">Provincia</Label>
              <Select items={PROV_ITEMS} value={province} onValueChange={setProvince}>
                <SelectTrigger id="no-prov" className="w-full"><SelectValue placeholder="Elegí" /></SelectTrigger>
                <SelectContent>{PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="no-canton">Cantón</Label>
              <Input id="no-canton" value={canton} onChange={(e) => setCanton(e.target.value)} />
            </div>
          </>
        )}
      </div>
      {touched && errors.shipping && <p className="-mt-3 text-xs text-destructive">{errors.shipping}</p>}

      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <div className="grid gap-2">
          <Label htmlFor="no-status">Estado inicial</Label>
          <Select items={STATUS_ITEMS} value={status} onValueChange={(v) => v && setStatus(v as OrderStatus)}>
            <SelectTrigger id="no-status" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(STATUS_ITEMS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="no-notes">Notas</Label>
          <Textarea id="no-notes" rows={1} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej.: paga por SINPE al recibir" />
        </div>
      </div>

      <Label className="flex items-center gap-3 font-normal">
        <Checkbox checked={discount} onCheckedChange={setDiscount} />
        Descontar estas unidades del inventario
      </Label>

      <DialogFooter className="items-center sm:justify-between">
        <p className="text-lg font-semibold tabular-nums">Total {formatCRC(total)}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Registrar pedido</Button>
        </div>
      </DialogFooter>
    </form>
  )
}
