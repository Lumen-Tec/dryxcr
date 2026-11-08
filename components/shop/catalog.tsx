"use client"

import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { ProductCard } from "@/components/shop/product-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CATEGORIES } from "@/lib/data/products"
import { formatCRC } from "@/lib/format"
import { totalStock } from "@/lib/pricing"
import { useProducts } from "@/lib/store"
import { usePricer } from "@/lib/store/hooks"
import type { Category } from "@/lib/types"
import { cn } from "@/lib/utils"

const SORTS = {
  relevancia: "Destacados",
  nuevos: "Más nuevos",
  "precio-asc": "Precio: menor a mayor",
  "precio-desc": "Precio: mayor a menor",
} as const
type Sort = keyof typeof SORTS

const SIZE_ORDER = ["S", "M", "L", "XL"]

export function Catalog() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const products = useProducts()
  const pricer = usePricer()

  // La URL manda en categoría, marca y búsqueda (así funcionan los links del header).
  const category = (params.get("categoria") as Category | null) ?? null
  const brands = params.getAll("marca")
  const q = params.get("q") ?? ""

  const [sizes, setSizes] = useState<string[]>([])
  const [onSale, setOnSale] = useState(false)
  const [inStock, setInStock] = useState(false)
  const [sort, setSort] = useState<Sort>("relevancia")
  const maxPrice = useMemo(() => Math.ceil(Math.max(...products.map((p) => p.price)) / 5000) * 5000, [products])
  const [priceMax, setPriceMax] = useState<number | null>(null)
  const ceiling = priceMax ?? maxPrice

  function setParam(mutate: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString())
    mutate(next)
    const s = next.toString()
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false })
  }

  const inCategory = products.filter((p) => !category || p.category === category)
  const allBrands = [...new Set(inCategory.map((p) => p.brand))].sort()
  const allSizes = [...new Set(inCategory.flatMap((p) => p.variants.map((v) => v.size)))].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a)
    const ib = SIZE_ORDER.indexOf(b)
    if (ia >= 0 || ib >= 0) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    return parseFloat(a) - parseFloat(b) || a.localeCompare(b)
  })

  const results = inCategory
    .map((p) => ({ p, pricing: pricer(p) }))
    .filter(({ p, pricing }) => {
      if (brands.length && !brands.includes(p.brand)) return false
      if (sizes.length && !p.variants.some((v) => sizes.includes(v.size) && v.stock > 0)) return false
      if (onSale && !pricing.compareAt) return false
      if (inStock && totalStock(p) === 0) return false
      if (pricing.price > ceiling) return false
      if (q) {
        const hay = `${p.name} ${p.brand} ${p.tags.join(" ")}`.toLowerCase()
        if (!q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sort === "precio-asc") return a.pricing.price - b.pricing.price
      if (sort === "precio-desc") return b.pricing.price - a.pricing.price
      if (sort === "nuevos") return b.p.createdAt.localeCompare(a.p.createdAt)
      return Number(b.p.featured) - Number(a.p.featured)
    })

  const activeCount = brands.length + sizes.length + Number(onSale) + Number(inStock) + Number(priceMax !== null)
  const clearAll = () => {
    setSizes([])
    setOnSale(false)
    setInStock(false)
    setPriceMax(null)
    setParam((p) => {
      p.delete("marca")
      p.delete("q")
    })
  }

  const title = category ? CATEGORIES.find((c) => c.id === category)?.label : "Toda la tienda"

  const filters = (
    <div className="flex flex-col gap-8">
      <FilterGroup title="Marca">
        {allBrands.map((b) => (
          <Label key={b} className="flex items-center gap-3 py-1 font-normal">
            <Checkbox
              checked={brands.includes(b)}
              onCheckedChange={(c) =>
                setParam((p) => {
                  const cur = p.getAll("marca").filter((x) => x !== b)
                  p.delete("marca")
                  ;(c ? [...cur, b] : cur).forEach((x) => p.append("marca", x))
                })
              }
            />
            {b}
          </Label>
        ))}
      </FilterGroup>

      <FilterGroup title="Talla">
        {!category ? (
          <p className="text-sm text-muted-foreground">Elegí una categoría para filtrar por talla.</p>
        ) : (
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => {
            const on = sizes.includes(s)
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setSizes((cur) => (on ? cur.filter((x) => x !== s) : [...cur, s]))}
                className={cn(
                  "h-9 min-w-11 rounded-md border px-2 text-sm tabular-nums transition-colors",
                  on ? "border-brand bg-brand text-brand-foreground" : "border-border hover:border-foreground/50",
                )}
              >
                {s}
              </button>
            )
          })}
        </div>
        )}
      </FilterGroup>

      <FilterGroup title="Precio máximo">
        <Slider
          min={10000}
          max={maxPrice}
          step={5000}
          value={[ceiling]}
          onValueChange={(v) => setPriceMax(Array.isArray(v) ? v[0] : v)}
          aria-label="Precio máximo"
        />
        <p className="mt-3 text-sm text-muted-foreground tabular-nums">Hasta {formatCRC(ceiling)}</p>
      </FilterGroup>

      <div className="flex flex-col gap-4">
        <Label className="flex items-center justify-between font-normal">
          Solo en oferta
          <Switch checked={onSale} onCheckedChange={setOnSale} />
        </Label>
        <Label className="flex items-center justify-between font-normal">
          Ocultar agotados
          <Switch checked={inStock} onCheckedChange={setInStock} />
        </Label>
      </div>

      {activeCount > 0 && (
        <Button variant="outline" onClick={clearAll}>
          Limpiar filtros ({activeCount})
        </Button>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-brand uppercase">Tienda</p>
            <h1 className="font-display text-5xl sm:text-7xl">{title}</h1>
          </div>
          <div className="relative w-full sm:w-80">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar: dunk, bulls, sueta…"
              aria-label="Buscar productos"
              className="h-10 pl-9"
              defaultValue={q}
              key={q}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = e.currentTarget.value.trim()
                  setParam((p) => (v ? p.set("q", v) : p.delete("q")))
                }
              }}
              onBlur={(e) => {
                const v = e.currentTarget.value.trim()
                if (v !== q) setParam((p) => (v ? p.set("q", v) : p.delete("q")))
              }}
            />
          </div>
        </div>

        <nav aria-label="Categorías">
        <ScrollArea scrollbars="horizontal" className="-mx-4 sm:mx-0">
        <div className="flex w-max gap-2 px-4 pb-2.5 sm:px-0">
          {[{ id: null, label: "Todo" }, ...CATEGORIES].map((c) => {
            const on = category === c.id
            return (
              <button
                key={c.id ?? "all"}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setParam((p) => {
                    setSizes([])
                    if (c.id) p.set("categoria", c.id)
                    else p.delete("categoria")
                    p.delete("marca")
                  })
                }
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  on ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50",
                )}
              >
                {c.label}
              </button>
            )
          })}
        </div>
        </ScrollArea>
        </nav>

        <div className="flex items-center justify-between gap-3 border-y border-border py-3">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" className="lg:hidden" />}>
                <SlidersHorizontalIcon data-icon="inline-start" />
                Filtros{activeCount > 0 && ` (${activeCount})`}
              </SheetTrigger>
              <SheetContent side="left" className="w-80 gap-0 p-0">
                <ScrollArea className="min-h-0 flex-1">
                  <div className="p-6">
                    <SheetTitle className="mb-4 font-display text-3xl">Filtros</SheetTitle>
                    {filters}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {results.length} {results.length === 1 ? "producto" : "productos"}
            </p>
            {q && (
              <button
                type="button"
                onClick={() => setParam((p) => p.delete("q"))}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
              >
                “{q}” <XIcon className="size-3" />
                <span className="sr-only">Quitar búsqueda</span>
              </button>
            )}
          </div>
          <Select items={SORTS} value={sort} onValueChange={(v) => v && setSort(v as Sort)}>
            <SelectTrigger className="w-52" aria-label="Ordenar">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORTS).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="sticky top-32">{filters}</div>
        </aside>
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-24 text-center">
            <p className="font-display text-3xl">Nada por aquí</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ningún producto coincide con esos filtros. Probá quitando alguno o escribinos y lo buscamos por vos.
            </p>
            <Button variant="outline" onClick={clearAll}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
            {results.map(({ p }, i) => (
              <ProductCard key={p.id} product={p} priority={i < 3} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">{title}</legend>
      {children}
    </fieldset>
  )
}
