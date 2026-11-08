"use client"

import { ArrowLeftIcon, MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { WhatsAppIcon } from "@/components/brand/social-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCRC } from "@/lib/format"
import { site, whatsappLink } from "@/lib/site"
import { cart, useCart, useProducts } from "@/lib/store"
import { usePricer } from "@/lib/store/hooks"
import { cartUI, useCartOpen } from "@/lib/store/ui"

export const PROVINCES = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"]

export function CartSheet() {
  const open = useCartOpen()
  const items = useCart()
  const products = useProducts()
  const pricer = usePricer()
  const [step, setStep] = useState<"cart" | "checkout">("cart")
  const [name, setName] = useState("")
  const [delivery, setDelivery] = useState<"pickup" | "shipping">("pickup")
  const [province, setProvince] = useState<string | null>(null)
  const [canton, setCanton] = useState("")
  const [notes, setNotes] = useState("")
  const [touched, setTouched] = useState(false)

  const lines = useMemo(
    () =>
      items.flatMap((it) => {
        const product = products.find((p) => p.id === it.productId)
        const variant = product?.variants.find((v) => v.id === it.variantId)
        if (!product || !variant) return []
        return [{ ...it, product, variant, unit: pricer(product).price }]
      }),
    [items, products, pricer],
  )
  const total = lines.reduce((s, l) => s + l.unit * l.qty, 0)
  const count = lines.reduce((s, l) => s + l.qty, 0)

  const errors = {
    name: name.trim().length < 2 ? "Escribí tu nombre para saber a quién atender." : "",
    province: delivery === "shipping" && !province ? "Elegí la provincia de entrega." : "",
    canton: delivery === "shipping" && canton.trim().length < 2 ? "Escribí el cantón o distrito." : "",
  }
  const valid = !errors.name && !errors.province && !errors.canton

  function buildMessage() {
    const rows = lines.map(
      (l) => `• ${l.qty}× ${l.product.name} (${l.variant.color} · ${l.variant.size}) — ${formatCRC(l.unit * l.qty)}`,
    )
    const entrega =
      delivery === "pickup" ? `Retiro en tienda (${site.address})` : `Envío por Correos de CR a ${canton.trim()}, ${province}`
    return [
      "¡Hola DRYX! 👋 Quiero hacer este pedido:",
      "",
      ...rows,
      "",
      `*Total: ${formatCRC(total)}*`,
      "",
      `Nombre: ${name.trim()}`,
      `Entrega: ${entrega}`,
      notes.trim() ? `Notas: ${notes.trim()}` : "",
    ]
      .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
      .join("\n")
      .trim()
  }

  function send() {
    setTouched(true)
    if (!valid) return
    window.open(whatsappLink(buildMessage()), "_blank", "noopener")
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        cartUI.set(v)
        if (!v) setStep("cart")
      }}
    >
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="font-display text-2xl">
            {step === "cart" ? "Tu carrito" : "Datos de entrega"}
          </SheetTitle>
          <SheetDescription>
            {step === "cart"
              ? count === 0
                ? "Todavía no agregaste nada."
                : `${count} ${count === 1 ? "producto" : "productos"}`
              : "Te abrimos WhatsApp con el pedido listo para enviar."}
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBagIcon className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Encontrá tu próximo par en el catálogo.</p>
            <Button render={<Link href="/tienda" />} onClick={() => cartUI.set(false)}>
              Ir a la tienda
            </Button>
          </div>
        ) : step === "cart" ? (
          <ScrollArea className="min-h-0 flex-1">
          <ul className="divide-y divide-border px-5">
            {lines.map((l) => (
              <li key={l.variantId} className="flex gap-4 py-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={l.product.images[0]}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                    style={{ objectPosition: l.product.imagePosition }}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Link
                    href={`/tienda/${l.product.slug}`}
                    onClick={() => cartUI.set(false)}
                    className="truncate text-sm font-medium hover:text-brand"
                  >
                    {l.product.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {l.variant.color} · Talla {l.variant.size}
                  </span>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-border">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Quitar uno"
                        onClick={() => cart.setQty(l.variantId, l.qty - 1)}
                      >
                        <MinusIcon />
                      </Button>
                      <span className="w-7 text-center text-sm tabular-nums" aria-live="polite">
                        {l.qty}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Agregar uno"
                        disabled={l.qty >= l.variant.stock}
                        onClick={() => cart.setQty(l.variantId, l.qty + 1)}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{formatCRC(l.unit * l.qty)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Eliminar ${l.product.name}`}
                  onClick={() => cart.remove(l.variantId)}
                  className="text-muted-foreground"
                >
                  <Trash2Icon />
                </Button>
              </li>
            ))}
          </ul>
          </ScrollArea>
        ) : (
          <ScrollArea className="min-h-0 flex-1">
          <form
            id="checkout"
            className="flex flex-col gap-5 p-5"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            noValidate
          >
            <div className="grid gap-2">
              <Label htmlFor="co-name">Nombre</Label>
              <Input
                id="co-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                aria-invalid={touched && !!errors.name}
                aria-describedby="co-name-err"
              />
              {touched && errors.name && (
                <p id="co-name-err" className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <fieldset className="grid gap-3">
              <legend className="mb-2 text-sm font-medium">¿Cómo lo querés recibir?</legend>
              <RadioGroup value={delivery} onValueChange={(v) => setDelivery(v as "pickup" | "shipping")} className="gap-2">
                <Label className="flex items-start gap-3 rounded-lg border border-border p-3 font-normal has-data-checked:border-brand">
                  <RadioGroupItem value="pickup" className="mt-0.5" />
                  <span className="grid gap-0.5">
                    <span className="font-medium">Retiro en tienda · Gratis</span>
                    <span className="text-xs text-muted-foreground">{site.address}</span>
                  </span>
                </Label>
                <Label className="flex items-start gap-3 rounded-lg border border-border p-3 font-normal has-data-checked:border-brand">
                  <RadioGroupItem value="shipping" className="mt-0.5" />
                  <span className="grid gap-0.5">
                    <span className="font-medium">Envío por Correos de CR</span>
                    <span className="text-xs text-muted-foreground">A todo el país · costo según destino</span>
                  </span>
                </Label>
              </RadioGroup>
            </fieldset>

            {delivery === "shipping" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="co-prov">Provincia</Label>
                  <Select value={province} onValueChange={(v) => setProvince(v)}>
                    <SelectTrigger id="co-prov" className="w-full" aria-invalid={touched && !!errors.province}>
                      <SelectValue placeholder="Elegí" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {touched && errors.province && <p className="text-xs text-destructive">{errors.province}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="co-canton">Cantón / distrito</Label>
                  <Input
                    id="co-canton"
                    value={canton}
                    onChange={(e) => setCanton(e.target.value)}
                    aria-invalid={touched && !!errors.canton}
                  />
                  {touched && errors.canton && <p className="text-xs text-destructive">{errors.canton}</p>}
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="co-notes">
                Notas <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id="co-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej.: ¿tienen la talla 42 en negro también?"
              />
            </div>
          </form>
          </ScrollArea>
        )}

        {lines.length > 0 && (
          <SheetFooter className="border-t border-border bg-card/60 p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-semibold tabular-nums">{formatCRC(total)}</span>
            </div>
            {step === "cart" ? (
              <Button size="lg" className="h-12 text-base" onClick={() => setStep("checkout")}>
                Continuar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="lg" className="h-12" onClick={() => setStep("cart")} aria-label="Volver al carrito">
                  <ArrowLeftIcon />
                </Button>
                <Button type="submit" form="checkout" size="lg" className="h-12 flex-1 bg-[#25D366] text-base text-black hover:bg-[#25D366]/85">
                  <WhatsAppIcon className="size-5" />
                  Enviar pedido por WhatsApp
                </Button>
              </div>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Confirmamos disponibilidad y forma de pago (SINPE Móvil o efectivo) por chat.
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
