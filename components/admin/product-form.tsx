"use client"

import { ArrowLeftIcon, CheckIcon, ImageIcon, XIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLayoutEffect, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MEDIA } from "@/lib/data/media"
import { CATEGORIES } from "@/lib/data/products"
import { slugify, uid } from "@/lib/format"
import { productsStore, useProducts } from "@/lib/store"
import type { Category, Product, Variant } from "@/lib/types"
import { cn } from "@/lib/utils"

const CAT_ITEMS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<Category, string>
const POSITIONS = {
  "50% 50%": "Centro",
  "50% 20%": "Arriba",
  "50% 35%": "Centro-arriba",
  "50% 65%": "Centro-abajo",
  "50% 85%": "Abajo",
}
const SIZE_PRESETS: Record<Category, string> = {
  sneakers: "38, 39, 40, 41, 42, 43, 44",
  ropa: "S, M, L, XL",
  gorras: "Ajustable",
  accesorios: "Única",
}

const split = (s: string) => [...new Set(s.split(",").map((x) => x.trim()).filter(Boolean))]

const BRAND_PREFIX: Record<string, string> = {
  dryx: "DRX",
  nike: "NIK",
  puma: "PUM",
  "new balance": "NB",
  "new era": "NE",
  jordan: "JOR",
  "hi-tec": "HTC",
}

/** Sugiere un SKU a partir de marca + nombre: "Nike" + "Air Max 90" → NIK-AIR-MAX. */
function suggestSku(brand: string, name: string) {
  const b = brand.trim().toLowerCase()
  const prefix = BRAND_PREFIX[b] ?? slugify(b).replace(/-/g, "").slice(0, 3).toUpperCase()
  const brandWords = new Set(b.split(/\s+/))
  const words = slugify(name)
    .split("-")
    .filter((w) => w && !brandWords.has(w))
    .slice(0, 2)
    .map((w) => w.toUpperCase().slice(0, 8))
  return [prefix, ...words].filter(Boolean).join("-")
}

/** Normaliza lo que se escribe: mayúsculas, espacios → guiones, solo A-Z 0-9 y guiones. */
const normalizeSku = (s: string) =>
  s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-{2,}/g, "-")

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter()
  const products = useProducts()
  const existing = productId ? products.find((p) => p.id === productId) : undefined

  // Next conserva el estado de las rutas ocultas. Cada vez que se sale del formulario se incrementa
  // `visit`, y el formulario se vuelve a montar con datos frescos al volver (sin restos del último
  // producto creado y sin stock desactualizado si se cambió en Inventario).
  const [visit, setVisit] = useState(0)
  useLayoutEffect(() => () => setVisit((v) => v + 1), [])

  if (productId && !existing) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-3xl">Producto no encontrado</p>
        <Button className="mt-4" variant="outline" nativeButton={false} render={<Link href="/admin/productos" />}>
          Volver a productos
        </Button>
      </div>
    )
  }

  return <Form key={`${existing?.id ?? "new"}-${visit}`} existing={existing} onDone={() => router.push("/admin/productos")} />
}

function Form({ existing, onDone }: { existing?: Product; onDone: () => void }) {
  const allProducts = useProducts()
  const [name, setName] = useState(existing?.name ?? "")
  const [brand, setBrand] = useState(existing?.brand ?? "")
  // Mientras no se edite a mano, el SKU de un producto nuevo se sugiere desde marca + nombre.
  const [skuInput, setSkuInput] = useState(existing?.sku ?? "")
  const [skuEdited, setSkuEdited] = useState(!!existing)
  const sku = (skuEdited ? skuInput : suggestSku(brand, name)).replace(/^-+|-+$/g, "")
  const [category, setCategory] = useState<Category>(existing?.category ?? "sneakers")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [price, setPrice] = useState(existing ? String(existing.price) : "")
  const [compareAt, setCompareAt] = useState(existing?.compareAtPrice ? String(existing.compareAtPrice) : "")
  const [images, setImages] = useState<string[]>(existing?.images ?? [])
  const [position, setPosition] = useState(existing?.imagePosition ?? "50% 50%")
  const [featured, setFeatured] = useState(existing?.featured ?? false)
  const [isDryx, setIsDryx] = useState(existing?.isDryx ?? false)
  const [colorsText, setColorsText] = useState(existing ? [...new Set(existing.variants.map((v) => v.color))].join(", ") : "Negro")
  const [sizesText, setSizesText] = useState(
    existing ? [...new Set(existing.variants.map((v) => v.size))].join(", ") : SIZE_PRESETS.sneakers,
  )
  const [stock, setStock] = useState<Record<string, number>>(() =>
    Object.fromEntries((existing?.variants ?? []).map((v) => [`${v.color}|${v.size}`, v.stock])),
  )
  const [picker, setPicker] = useState(false)
  const [touched, setTouched] = useState(false)

  const positionItems: Record<string, string> =
    position in POSITIONS ? POSITIONS : { [position]: "Personalizado (de la semilla)", ...POSITIONS }
  const colors = split(colorsText)
  const sizes = split(sizesText)
  const priceN = Number(price)
  const compareN = Number(compareAt)

  const errors = {
    name: name.trim().length < 3 ? "El nombre necesita al menos 3 caracteres." : "",
    brand: !brand.trim() ? "Indicá la marca." : "",
    sku:
      sku.length < 3
        ? "El SKU necesita al menos 3 caracteres."
        : allProducts.some((p) => p.id !== existing?.id && p.sku?.toUpperCase() === sku)
          ? `El SKU ${sku} ya lo usa otro producto.`
          : "",
    price: !(priceN > 0) ? "Ingresá un precio mayor a 0." : "",
    compareAt: compareAt && compareN <= priceN ? "El precio anterior debe ser mayor al precio actual." : "",
    images: images.length === 0 ? "Elegí al menos una imagen." : "",
    variants: colors.length === 0 || sizes.length === 0 ? "Definí al menos un color y una talla." : "",
  }
  const firstError = Object.values(errors).find(Boolean)

  function save(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (firstError) {
      toast.error("Revisá el formulario", { description: firstError })
      return
    }
    const base = slugify(name)
    const variants: Variant[] = colors.flatMap((c) =>
      sizes.map((s) => {
        const prev = existing?.variants.find((v) => v.color === c && v.size === s)
        return { id: prev?.id ?? `${base}-${slugify(c)}-${slugify(s)}-${uid()}`, color: c, size: s, stock: Math.max(0, stock[`${c}|${s}`] ?? 0) }
      }),
    )
    const product: Product = {
      id: existing?.id ?? `p-${uid()}`,
      slug: existing?.slug ?? base,
      sku,
      name: name.trim(),
      brand: brand.trim(),
      category,
      description: description.trim(),
      price: priceN,
      compareAtPrice: compareAt ? compareN : undefined,
      images,
      imagePosition: position,
      tags: existing?.tags ?? [],
      featured,
      isDryx,
      variants,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    }
    productsStore.set((all) => {
      if (existing) return all.map((p) => (p.id === existing.id ? product : p))
      const taken = all.some((p) => p.slug === product.slug)
      return [{ ...product, slug: taken ? `${product.slug}-${uid().slice(0, 4)}` : product.slug }, ...all]
    })
    toast.success(existing ? "Cambios guardados" : "Producto creado", { description: product.name })
    onDone()
  }

  const err = (k: keyof typeof errors) =>
    touched && errors[k] ? <p className="text-xs text-destructive">{errors[k]}</p> : null

  return (
    <form onSubmit={save} noValidate>
      <PageHeader
        title={existing ? "Editar producto" : "Nuevo producto"}
        description={existing ? existing.name : "Se publica en la tienda al guardar."}
        actions={
          <>
            <Button variant="outline" nativeButton={false} render={<Link href="/admin/productos" />}>
              <ArrowLeftIcon data-icon="inline-start" /> Cancelar
            </Button>
            <Button type="submit">
              <CheckIcon data-icon="inline-start" /> {existing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans font-semibold">Información</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
                <div className="grid content-start gap-2">
                  <Label htmlFor="f-name">Nombre</Label>
                  <Input id="f-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={touched && !!errors.name} />
                  {err("name")}
                </div>
                <div className="grid content-start gap-2">
                  <Label htmlFor="f-sku">SKU</Label>
                  <Input
                    id="f-sku"
                    value={sku}
                    onChange={(e) => {
                      setSkuEdited(true)
                      setSkuInput(normalizeSku(e.target.value))
                    }}
                    placeholder="NIK-AIR-MAX"
                    autoComplete="off"
                    spellCheck={false}
                    className="font-mono uppercase"
                    aria-invalid={(touched || skuEdited) && !!errors.sku}
                    aria-describedby="f-sku-hint"
                  />
                  {(touched || skuEdited) && errors.sku ? (
                    <p className="text-xs text-destructive">{errors.sku}</p>
                  ) : (
                    <p id="f-sku-hint" className="text-xs text-muted-foreground">
                      {skuEdited ? "Letras, números y guiones." : "Sugerido desde marca y nombre. Podés editarlo."}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="f-brand">Marca</Label>
                  <Input id="f-brand" value={brand} onChange={(e) => setBrand(e.target.value)} list="brands" aria-invalid={touched && !!errors.brand} />
                  <datalist id="brands">
                    {["DRYX", "Nike", "Puma", "New Balance", "Jordan", "New Era", "Hi-Tec"].map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                  {err("brand")}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="f-cat">Categoría</Label>
                  <Select
                    items={CAT_ITEMS}
                    value={category}
                    onValueChange={(v) => {
                      if (!v) return
                      setCategory(v as Category)
                      if (!existing) setSizesText(SIZE_PRESETS[v as Category])
                    }}
                  >
                    <SelectTrigger id="f-cat" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="f-desc">Descripción</Label>
                <Textarea id="f-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-sans font-semibold">Variantes e inventario</CardTitle>
              <CardDescription>Separá colores y tallas con comas. El stock se define por combinación.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="f-colors">Colores</Label>
                  <Input id="f-colors" value={colorsText} onChange={(e) => setColorsText(e.target.value)} placeholder="Negro, Blanco" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="f-sizes">Tallas</Label>
                  <Input id="f-sizes" value={sizesText} onChange={(e) => setSizesText(e.target.value)} placeholder="S, M, L" />
                </div>
              </div>
              {err("variants")}
              {colors.length > 0 && sizes.length > 0 && (
                <ScrollArea scrollbars="horizontal" className="rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="px-3 py-2 text-left font-medium">Color \ Talla</th>
                        {sizes.map((s) => (
                          <th key={s} className="px-2 py-2 text-center font-medium tabular-nums">{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {colors.map((c) => (
                        <tr key={c} className="border-b border-border last:border-0">
                          <th scope="row" className="px-3 py-2 text-left font-normal whitespace-nowrap">{c}</th>
                          {sizes.map((s) => {
                            const k = `${c}|${s}`
                            return (
                              <td key={s} className="px-1 py-1.5">
                                <Input
                                  type="number"
                                  min={0}
                                  inputMode="numeric"
                                  aria-label={`Stock ${c} talla ${s}`}
                                  value={stock[k] ?? 0}
                                  onChange={(e) => setStock((st) => ({ ...st, [k]: Number(e.target.value) }))}
                                  className="h-8 min-w-14 text-center tabular-nums"
                                />
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans font-semibold">Precio</CardTitle>
              <CardDescription>Para mostrar “antes/ahora”, poné el precio anterior.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="f-price">Precio actual (₡)</Label>
                <Input id="f-price" type="number" min={0} step={100} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} aria-invalid={touched && !!errors.price} />
                {err("price")}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="f-compare">
                  Precio anterior (₡) <span className="font-normal text-muted-foreground">opcional</span>
                </Label>
                <Input id="f-compare" type="number" min={0} step={100} inputMode="numeric" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} aria-invalid={touched && !!errors.compareAt} />
                {err("compareAt")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-sans font-semibold">Imágenes</CardTitle>
              <CardDescription>La primera es la portada. Las fotos vienen del Instagram de DRYX.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-3 gap-2">
                {images.map((src, i) => (
                  <div key={src} className={cn("group relative aspect-[4/5] overflow-hidden rounded-md bg-muted", i === 0 && "ring-2 ring-brand")}>
                    <Image src={src} alt="" fill sizes="120px" className="object-cover" style={{ objectPosition: i === 0 ? position : undefined }} />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((x) => x !== src))}
                      className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-background/80"
                      aria-label="Quitar imagen"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => setImages([src, ...images.filter((x) => x !== src)])}
                        className="absolute inset-x-1 bottom-1 rounded bg-background/80 py-0.5 text-[0.65rem]"
                      >
                        Usar de portada
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setPicker(true)}
                  className="grid aspect-[4/5] place-items-center rounded-md border border-dashed border-border text-xs text-muted-foreground hover:border-foreground/50"
                >
                  <span className="grid justify-items-center gap-1">
                    <ImageIcon className="size-5" /> Agregar
                  </span>
                </button>
              </div>
              {err("images")}
              <div className="grid gap-2">
                <Label htmlFor="f-pos">Encuadre de portada</Label>
                <Select items={positionItems} value={position} onValueChange={(v) => v && setPosition(v)}>
                  <SelectTrigger id="f-pos" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(positionItems).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-sans font-semibold">Visibilidad</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Label className="flex items-center justify-between gap-4 font-normal">
                <span className="grid gap-0.5">
                  <span className="font-medium">Destacado</span>
                  <span className="text-xs text-muted-foreground">Aparece en “Lo más buscado” de la landing.</span>
                </span>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </Label>
              <Label className="flex items-center justify-between gap-4 font-normal">
                <span className="grid gap-0.5">
                  <span className="font-medium">Marca DRYX</span>
                  <span className="text-xs text-muted-foreground">Muestra la etiqueta de marca nacional.</span>
                </span>
                <Switch checked={isDryx} onCheckedChange={setIsDryx} />
              </Label>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={picker} onOpenChange={setPicker}>
        <DialogContent className="gap-0 p-0 sm:max-w-3xl">
          <ScrollArea viewportClassName="max-h-[85svh]">
          <div className="grid gap-4 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Biblioteca de imágenes</DialogTitle>
            <DialogDescription>Tocá para agregar o quitar. Fotos tomadas de @dryx.cr.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {MEDIA.map((src) => {
              const on = images.includes(src)
              return (
                <button
                  key={src}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setImages(on ? images.filter((x) => x !== src) : [...images, src])}
                  className={cn("relative aspect-[4/5] overflow-hidden rounded-md bg-muted ring-2", on ? "ring-brand" : "ring-transparent hover:ring-border")}
                >
                  <Image src={src} alt="" fill sizes="150px" className="object-cover" />
                  {on && (
                    <span className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-brand text-brand-foreground">
                      <CheckIcon className="size-3.5" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </form>
  )
}
