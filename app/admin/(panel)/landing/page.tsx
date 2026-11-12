"use client"

import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, CheckIcon, ExternalLinkIcon, PlayIcon, PlusIcon, XIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useLayoutEffect, useState } from "react"
import { toast } from "sonner"
import { ProductPicker } from "@/components/admin/product-picker"
import { PageHeader } from "@/components/admin/status"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FEATURED_LIMIT } from "@/lib/data/landing"
import { VIDEOS } from "@/lib/data/media"
import { formatDate } from "@/lib/format"
import { featuredProducts, landingBanner } from "@/lib/landing"
import { landingStore, productsStore, useLanding, useProducts, usePromotions } from "@/lib/store"
import { useNow, usePricer } from "@/lib/store/hooks"
import type { LandingContent } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Qué espacio se está cambiando en la biblioteca de videos. */
type Slot = { kind: "hero" } | { kind: "reel"; index: number }

const update = (patch: (cur: LandingContent) => Partial<LandingContent>) => landingStore.set((cur) => ({ ...cur, ...patch(cur) }))

function move<T>(list: T[], from: number, by: -1 | 1) {
  const to = from + by
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  ;[next[from], next[to]] = [next[to], next[from]]
  return next
}

export default function LandingPage() {
  const landing = useLanding()
  const products = useProducts()
  const pricer = usePricer()
  const banner = landingBanner(usePromotions(), useNow())
  const [slot, setSlot] = useState<Slot | null>(null)
  const [brand, setBrand] = useState("")
  // La biblioteca es estado transitorio: se cierra al salir de la página (Next oculta la ruta, no la desmonta).
  useLayoutEffect(() => () => setSlot(null), [])

  const featured = featuredProducts(products, landing.featuredOrder)
  const featuredIds = featured.map((p) => p.id)
  const currentSrc = slot?.kind === "hero" ? landing.hero.src : slot ? landing.reels[slot.index]?.src : null

  function pickVideo(video: (typeof VIDEOS)[number]) {
    if (!slot) return
    if (slot.kind === "hero") {
      update(() => ({ hero: { src: video.src, poster: video.poster } }))
      toast.success("Video principal actualizado")
    } else {
      update((cur) => ({
        reels: cur.reels.map((r, i) => (i === slot.index ? { src: video.src, poster: video.poster, caption: video.label } : r)),
      }))
      toast.success(`Reel ${slot.index + 1} actualizado`)
    }
    setSlot(null)
  }

  function addBrand(e: React.FormEvent) {
    e.preventDefault()
    const name = brand.trim()
    if (!name) return
    if (landing.brands.some((b) => b.toLowerCase() === name.toLowerCase())) {
      toast.error(`${name} ya está en la lista`)
      return
    }
    update((cur) => ({ brands: [...cur.brands, name] }))
    setBrand("")
  }

  function setFeatured(id: string, on: boolean) {
    productsStore.set((all) => all.map((p) => (p.id === id ? { ...p, featured: on } : p)))
    update(() => ({ featuredOrder: on ? [...featuredIds, id] : featuredIds.filter((x) => x !== id) }))
  }

  return (
    <>
      <PageHeader
        title="Página de inicio"
        description="Lo que ve el cliente al entrar al sitio. Los cambios se publican al instante."
        actions={
          <Button variant="outline" nativeButton={false} render={<Link href="/" target="_blank" />}>
            <ExternalLinkIcon data-icon="inline-start" /> Ver página
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-sans font-semibold">Video principal</CardTitle>
            <CardDescription>El video de fondo que abre la página. Se reproduce solo y sin sonido.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <Image src={landing.hero.poster} alt="" fill sizes="(min-width: 1280px) 40vw, 90vw" className="object-cover" />
              <span className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-0.5 text-xs">
                {VIDEOS.find((v) => v.src === landing.hero.src)?.label ?? "Video personalizado"}
              </span>
            </div>
            <div>
              <Button variant="outline" onClick={() => setSlot({ kind: "hero" })}>
                <PlayIcon data-icon="inline-start" /> Cambiar video
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-sans font-semibold">Banner de promoción</CardTitle>
            <CardDescription>
              Sale solo desde Promociones: la primera promo tipo banner que esté vigente y tenga foto.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {banner?.image ? (
              <div className="flex gap-4 rounded-lg bg-brand p-3 text-brand-foreground">
                <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-md">
                  <Image src={banner.image} alt="" fill sizes="96px" className="object-cover" style={{ objectPosition: banner.imagePosition }} />
                </div>
                <div className="min-w-0 self-center">
                  <p className="font-display text-2xl text-balance">{banner.title}</p>
                  <p className="mt-1 text-xs text-pretty opacity-90">{banner.subtitle}</p>
                  <p className="mt-2 text-xs opacity-75">Hasta el {formatDate(banner.endsAt)}</p>
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-pretty text-muted-foreground">
                Ahora no hay ningún banner con foto vigente, así que esa sección no se muestra en la página.
              </p>
            )}
            <div>
              <Button variant="outline" nativeButton={false} render={<Link href="/admin/promociones" />}>
                Ir a promociones <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="font-sans font-semibold">Reels · “Así se vive DRYX”</CardTitle>
            <CardDescription>Cuatro espacios fijos. Tocá un video para cambiarlo y editá el texto que lo acompaña.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {landing.reels.map((r, i) => (
                <li key={i} className="grid content-start gap-2">
                  <button
                    type="button"
                    onClick={() => setSlot({ kind: "reel", index: i })}
                    aria-label={`Cambiar el video del reel ${i + 1}`}
                    className="group relative aspect-[9/16] overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Image src={r.poster} alt="" fill sizes="(min-width: 1024px) 20vw, 45vw" className="object-cover" />
                    <span className="absolute inset-0 grid place-items-center bg-black/40 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      Cambiar video
                    </span>
                    <span className="absolute top-2 left-2 grid size-6 place-items-center rounded-full bg-background/80 text-xs tabular-nums">
                      {i + 1}
                    </span>
                  </button>
                  <Input
                    value={r.caption}
                    onChange={(e) =>
                      update((cur) => ({ reels: cur.reels.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)) }))
                    }
                    aria-label={`Texto del reel ${i + 1}`}
                    placeholder="Texto del reel"
                    maxLength={48}
                  />
                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Mover el reel ${i + 1} a la izquierda`}
                      disabled={i === 0}
                      onClick={() => update((cur) => ({ reels: move(cur.reels, i, -1) }))}
                    >
                      <ArrowLeftIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Mover el reel ${i + 1} a la derecha`}
                      disabled={i === landing.reels.length - 1}
                      onClick={() => update((cur) => ({ reels: move(cur.reels, i, 1) }))}
                    >
                      <ArrowRightIcon />
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-sans font-semibold">Productos destacados</CardTitle>
            <CardDescription>
              La sección “Lo más buscado” muestra los primeros {FEATURED_LIMIT}, en este orden.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <ProductPicker
              products={products.filter((p) => !p.featured)}
              value={null}
              onChange={(id) => setFeatured(id, true)}
              priceOf={(p) => pricer(p).price}
            />
            {featured.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                Todavía no hay productos destacados. Buscá uno arriba para agregarlo.
              </p>
            ) : (
              <ol className="divide-y divide-border rounded-lg border border-border">
                {featured.map((p, i) => (
                  <li key={p.id} className={cn("flex items-center gap-3 p-2", i >= FEATURED_LIMIT && "opacity-60")}>
                    <span className="w-5 text-center text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                    <div className="relative size-10 shrink-0 overflow-hidden rounded bg-muted">
                      <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" style={{ objectPosition: p.imagePosition }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                    {i >= FEATURED_LIMIT && <Badge variant="outline">No se muestra</Badge>}
                    <div className="flex shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Subir ${p.name}`}
                        disabled={i === 0}
                        onClick={() => update(() => ({ featuredOrder: move(featuredIds, i, -1) }))}
                      >
                        <ArrowUpIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Bajar ${p.name}`}
                        disabled={i === featured.length - 1}
                        onClick={() => update(() => ({ featuredOrder: move(featuredIds, i, 1) }))}
                      >
                        <ArrowDownIcon />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label={`Quitar ${p.name} de destacados`} onClick={() => setFeatured(p.id, false)}>
                        <XIcon />
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-sans font-semibold">Marcas</CardTitle>
            <CardDescription>La cinta de marcas que se mueve debajo del video principal.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <form onSubmit={addBrand} className="flex gap-2">
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ej.: Adidas" aria-label="Nueva marca" maxLength={24} />
              <Button type="submit" variant="outline" disabled={!brand.trim()}>
                <PlusIcon data-icon="inline-start" /> Agregar
              </Button>
            </form>
            {landing.brands.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                Sin marcas, la cinta no se muestra en la página.
              </p>
            ) : (
              <ol className="divide-y divide-border rounded-lg border border-border">
                {landing.brands.map((b, i) => (
                  <li key={b} className="flex items-center gap-3 py-1.5 pr-2 pl-3">
                    <span className="min-w-0 flex-1 truncate text-sm">{b}</span>
                    <div className="flex shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Subir ${b}`}
                        disabled={i === 0}
                        onClick={() => update((cur) => ({ brands: move(cur.brands, i, -1) }))}
                      >
                        <ArrowUpIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Bajar ${b}`}
                        disabled={i === landing.brands.length - 1}
                        onClick={() => update((cur) => ({ brands: move(cur.brands, i, 1) }))}
                      >
                        <ArrowDownIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Quitar ${b}`}
                        onClick={() => update((cur) => ({ brands: cur.brands.filter((x) => x !== b) }))}
                      >
                        <XIcon />
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!slot} onOpenChange={(o) => !o && setSlot(null)}>
        <DialogContent className="gap-0 p-0 sm:max-w-3xl">
          <ScrollArea viewportClassName="max-h-[85svh]">
            <div className="grid gap-4 p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>Biblioteca de videos</DialogTitle>
                <DialogDescription>
                  Tocá un video para usarlo. En la versión final acá mismo se suben videos nuevos desde el celular o la compu.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {VIDEOS.map((v) => {
                  const on = v.src === currentSrc
                  return (
                    <button
                      key={v.src}
                      type="button"
                      aria-pressed={on}
                      onClick={() => pickVideo(v)}
                      className={cn(
                        "relative aspect-[9/16] overflow-hidden rounded-md bg-muted text-left ring-2",
                        on ? "ring-brand" : "ring-transparent hover:ring-border",
                      )}
                    >
                      <Image src={v.poster} alt="" fill sizes="150px" className="object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 text-[0.7rem] leading-tight text-white">
                        {v.label}
                      </span>
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
    </>
  )
}
