"use client"

import { CheckIcon, MinusIcon, PackageIcon, PlusIcon, RefreshCwIcon, ShieldCheckIcon, StoreIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { WhatsAppIcon } from "@/components/brand/social-icons"
import { SectionHeading } from "@/components/landing/categories"
import { Price } from "@/components/shop/price"
import { ProductCard } from "@/components/shop/product-card"
import { Button } from "@/components/ui/button"
import { categoryLabel } from "@/lib/data/products"
import { formatCRC } from "@/lib/format"
import { site, whatsappLink } from "@/lib/site"
import { cart, useCart, useProducts } from "@/lib/store"
import { usePricer } from "@/lib/store/hooks"
import { cartUI } from "@/lib/store/ui"
import { cn } from "@/lib/utils"

export function ProductDetail({ slug }: { slug: string }) {
  const products = useProducts()
  const pricer = usePricer()
  const cartItems = useCart()
  const product = products.find((p) => p.slug === slug)

  const colors = product ? [...new Set(product.variants.map((v) => v.color))] : []
  const [color, setColor] = useState<string | null>(null)
  const [size, setSize] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [imgIdx, setImgIdx] = useState(0)
  const [sizeError, setSizeError] = useState(false)

  if (!product) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-32 text-center">
        <h1 className="font-display text-5xl">Este producto ya voló</h1>
        <p className="text-muted-foreground">Puede que se haya agotado o que el enlace esté mal escrito.</p>
        <Button nativeButton={false} render={<Link href="/tienda" />}>
          Ver la tienda
        </Button>
      </div>
    )
  }

  const activeColor = color ?? colors[0]
  const forColor = product.variants.filter((v) => v.color === activeColor)
  const variant = forColor.find((v) => v.size === size)
  const pricing = pricer(product)
  const inCart = variant ? (cartItems.find((i) => i.variantId === variant.id)?.qty ?? 0) : 0
  const available = variant ? Math.max(0, variant.stock - inCart) : 0
  const soldOut = product.variants.every((v) => v.stock === 0)
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  function addToCart() {
    if (!product) return
    if (!variant) {
      setSizeError(true)
      return
    }
    cart.add(product.id, variant.id, qty)
    setQty(1)
    toast.success(`${product.name} agregado`, {
      description: `${variant.color} · Talla ${variant.size}`,
      action: { label: "Ver carrito", onClick: () => cartUI.open() },
    })
  }

  const askText = `¡Hola DRYX! Me interesa *${product.name}*${variant ? ` (${variant.color} · talla ${variant.size})` : ""} a ${formatCRC(pricing.price)}. ¿Está disponible?`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav aria-label="Ruta" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/tienda" className="hover:text-foreground">Tienda</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/tienda?categoria=${product.category}`} className="hover:text-foreground">{categoryLabel(product.category)}</Link></li>
          <li aria-hidden>/</li>
          <li className="truncate text-foreground" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        {/* Galería */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {product.images.length > 1 && (
            <div className="flex gap-3 sm:flex-col">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  aria-pressed={i === imgIdx}
                  className={cn(
                    "relative size-20 overflow-hidden rounded-md border-2 bg-muted",
                    i === imgIdx ? "border-brand" : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-xl bg-muted">
            <Image
              key={product.images[imgIdx]}
              src={product.images[imgIdx] ?? product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
              style={{ objectPosition: imgIdx === 0 ? product.imagePosition : "50% 50%" }}
            />
            {pricing.discount ? (
              <span className="absolute top-4 left-4 rounded bg-brand px-3 py-1 text-sm font-bold text-brand-foreground">
                -{pricing.discount}%
              </span>
            ) : null}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <div>
            <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              {product.brand}
              {product.isDryx && <span className="ml-2 text-brand">· Marca nacional</span>}
            </p>
            <h1 className="mt-2 font-display text-5xl text-balance sm:text-6xl">{product.name}</h1>
            <Price pricing={pricing} size="lg" className="mt-4" />
            {pricing.promo && <p className="mt-1 text-sm text-brand">{pricing.promo.title}</p>}
          </div>

          <p className="text-pretty text-muted-foreground">{product.description}</p>

          {colors.length > 1 && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium">
                Color: <span className="text-muted-foreground">{activeColor}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={c === activeColor}
                    onClick={() => {
                      setColor(c)
                      setSize(null)
                    }}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm",
                      c === activeColor ? "border-foreground" : "border-border hover:border-foreground/50",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset>
            <legend className="mb-2 flex w-full justify-between text-sm font-medium">
              <span>Talla</span>
              {variant && (
                <span className={cn("font-normal", variant.stock <= 2 ? "text-warning" : "text-muted-foreground")}>
                  {variant.stock === 0 ? "Agotada" : variant.stock <= 2 ? `¡Solo ${variant.stock} disponible${variant.stock > 1 ? "s" : ""}!` : `${variant.stock} disponibles`}
                </span>
              )}
            </legend>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {forColor.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  disabled={v.stock === 0}
                  aria-pressed={v.size === size}
                  onClick={() => {
                    setSize(v.size)
                    setSizeError(false)
                    setQty(1)
                  }}
                  className={cn(
                    "h-11 rounded-md border text-sm tabular-nums transition-colors disabled:cursor-not-allowed disabled:text-muted-foreground/50 disabled:line-through",
                    v.size === size ? "border-brand bg-brand text-brand-foreground" : "border-border hover:border-foreground/50",
                  )}
                >
                  {v.size}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                Elegí una talla para agregarlo al carrito.
              </p>
            )}
          </fieldset>

          <div className="flex gap-3">
            <div className="flex items-center rounded-md border border-border">
              <Button variant="ghost" size="icon-lg" aria-label="Menos" disabled={qty <= 1} onClick={() => setQty(qty - 1)}>
                <MinusIcon />
              </Button>
              <span className="w-8 text-center tabular-nums">{qty}</span>
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label="Más"
                disabled={!!variant && qty >= available}
                onClick={() => setQty(qty + 1)}
              >
                <PlusIcon />
              </Button>
            </div>
            <Button
              size="lg"
              className="h-auto flex-1 text-base"
              disabled={soldOut || (!!variant && available === 0)}
              onClick={addToCart}
            >
              {soldOut ? "Agotado" : variant && available === 0 ? "Ya tenés todas en el carrito" : "Agregar al carrito"}
            </Button>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="h-12 text-base"
            nativeButton={false}
            render={<a href={whatsappLink(askText)} target="_blank" rel="noreferrer" />}
          >
            <WhatsAppIcon className="size-5 text-[#25D366]" data-icon="inline-start" />
            Consultar por WhatsApp
          </Button>

          <ul className="grid gap-3 rounded-xl border border-border p-5 text-sm">
            <li className="flex gap-3"><ShieldCheckIcon className="size-5 shrink-0 text-brand" /> Producto original, calidad garantizada</li>
            <li className="flex gap-3"><PackageIcon className="size-5 shrink-0 text-brand" /> Envíos a todo Costa Rica por Correos de CR</li>
            <li className="flex gap-3"><StoreIcon className="size-5 shrink-0 text-brand" /> Retiro gratis en {site.address}</li>
            <li className="flex gap-3"><RefreshCwIcon className="size-5 shrink-0 text-brand" /> Cambios únicamente por talla, según políticas de tienda</li>
          </ul>

          {inCart > 0 && (
            <p className="flex items-center gap-2 text-sm text-success">
              <CheckIcon className="size-4" /> Tenés {inCart} en el carrito.
              <button type="button" className="underline underline-offset-4" onClick={() => cartUI.open()}>
                Ver carrito
              </button>
            </p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <SectionHeading eyebrow="Combinalo con" title="También te puede gustar" />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
