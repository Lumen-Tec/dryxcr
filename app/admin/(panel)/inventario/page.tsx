"use client"

import { MinusIcon, PlusIcon, SearchIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { PageHeader } from "@/components/admin/status"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LOW_STOCK } from "@/lib/pricing"
import { productsStore, useProducts } from "@/lib/store"

type Filter = "todo" | "bajo" | "agotado"

function setStock(productId: string, variantId: string, stock: number) {
  productsStore.set((all) =>
    all.map((p) =>
      p.id !== productId ? p : { ...p, variants: p.variants.map((v) => (v.id === variantId ? { ...v, stock: Math.max(0, stock) } : v)) },
    ),
  )
}

function Inventory() {
  const products = useProducts()
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  // El filtro vive en la URL: así el link "Stock bajo" del dashboard funciona aunque la página
  // ya se haya visitado (Next conserva el estado local de las rutas ocultas).
  const raw = params.get("filtro")
  const filter: Filter = raw === "bajo" || raw === "agotado" ? raw : "todo"
  const setFilter = (f: Filter) => router.replace(f === "todo" ? pathname : `${pathname}?filtro=${f}`, { scroll: false })
  const [q, setQ] = useState("")

  const all = products.flatMap((p) => p.variants.map((v) => ({ p, v })))
  const units = all.reduce((s, r) => s + r.v.stock, 0)
  const low = all.filter((r) => r.v.stock > 0 && r.v.stock <= LOW_STOCK).length
  const out = all.filter((r) => r.v.stock === 0).length

  const rows = all.filter(({ p, v }) => {
    if (filter === "bajo" && !(v.stock <= LOW_STOCK)) return false
    if (filter === "agotado" && v.stock !== 0) return false
    if (q && !`${p.sku} ${p.name} ${p.brand} ${v.color} ${v.size}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <>
      <PageHeader title="Inventario" description="Stock por variante (color × talla). Los cambios se reflejan en la tienda al instante." />

      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: "Unidades en tienda", value: units },
          { label: `Stock bajo (≤ ${LOW_STOCK})`, value: low, tone: "text-warning" },
          { label: "Variantes agotadas", value: out, tone: "text-destructive" },
        ].map((k) => (
          <Card key={k.label} size="sm">
            <CardContent>
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className={`mt-1 text-2xl font-semibold tabular-nums ${k.tone ?? ""}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="todo">Todo</TabsTrigger>
            <TabsTrigger value="bajo">Stock bajo</TabsTrigger>
            <TabsTrigger value="agotado">Agotados</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Producto, SKU, color o talla" className="pl-9" aria-label="Buscar en inventario" />
        </div>
        <span className="text-sm text-muted-foreground" aria-live="polite">{rows.length} variantes</span>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Producto</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Talla</TableHead>
              <TableHead className="hidden sm:table-cell">Estado</TableHead>
              <TableHead className="pr-4 text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ p, v }) => (
              <TableRow key={v.id}>
                <TableCell className="pl-4">
                  <Link href={`/admin/productos/${p.id}`} className="flex items-center gap-3 hover:text-brand">
                    <div className="relative size-9 shrink-0 overflow-hidden rounded bg-muted">
                      <Image src={p.images[0]} alt="" fill sizes="36px" className="object-cover" style={{ objectPosition: p.imagePosition }} />
                    </div>
                    <span className="grid min-w-0">
                      <span className="max-w-56 truncate">{p.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{p.sku}</span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell>{v.color}</TableCell>
                <TableCell className="tabular-nums">{v.size}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {v.stock === 0 ? (
                    <span className="text-destructive">Agotado</span>
                  ) : v.stock <= LOW_STOCK ? (
                    <span className="text-warning">Stock bajo</span>
                  ) : (
                    <span className="text-muted-foreground">Disponible</span>
                  )}
                </TableCell>
                <TableCell className="pr-4">
                  <div className="ml-auto flex w-fit items-center rounded-md border border-border">
                    <Button variant="ghost" size="icon-sm" aria-label={`Restar uno a ${p.name} ${v.color} ${v.size}`} disabled={v.stock === 0} onClick={() => setStock(p.id, v.id, v.stock - 1)}>
                      <MinusIcon />
                    </Button>
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) => setStock(p.id, v.id, Number(e.target.value))}
                      aria-label={`Stock de ${p.name} ${v.color} talla ${v.size}`}
                      className="w-12 [appearance:textfield] bg-transparent text-center text-sm tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button variant="ghost" size="icon-sm" aria-label={`Sumar uno a ${p.name} ${v.color} ${v.size}`} onClick={() => setStock(p.id, v.id, v.stock + 1)}>
                      <PlusIcon />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  Nada que mostrar con este filtro.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <Inventory />
    </Suspense>
  )
}
