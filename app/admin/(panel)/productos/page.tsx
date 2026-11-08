"use client"

import { MoreHorizontalIcon, PencilIcon, PlusIcon, SearchIcon, StarIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useLayoutEffect, useState } from "react"
import { toast } from "sonner"
import { productCode } from "@/components/admin/product-picker"
import { PageHeader } from "@/components/admin/status"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CATEGORIES, categoryLabel } from "@/lib/data/products"
import { formatCRC } from "@/lib/format"
import { totalStock } from "@/lib/pricing"
import { productsStore, useProducts } from "@/lib/store"
import { usePricer } from "@/lib/store/hooks"
import type { Product } from "@/lib/types"

const CAT_ITEMS = { all: "Todas las categorías", ...Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) }

export default function ProductsPage() {
  const products = useProducts()
  const pricer = usePricer()
  const [q, setQ] = useState("")
  const [cat, setCat] = useState("all")
  const [toDelete, setToDelete] = useState<Product | null>(null)
  // Diálogos/paneles abiertos son estado transitorio: se cierran al salir de la página
  // (Next oculta la ruta en vez de desmontarla y, si no, reaparecerían abiertos al volver).
  useLayoutEffect(() => () => setToDelete(null), [])

  const rows = products.filter(
    (p) =>
      (cat === "all" || p.category === cat) &&
      (!q || `${productCode(p)} ${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase())),
  )

  const toggleFeatured = (p: Product) =>
    productsStore.set((all) => all.map((x) => (x.id === p.id ? { ...x, featured: !x.featured } : x)))

  return (
    <>
      <PageHeader
        title="Productos"
        description={`${products.length} productos en el catálogo`}
        actions={
          <Button nativeButton={false} render={<Link href="/admin/productos/nuevo" />}>
            <PlusIcon data-icon="inline-start" /> Nuevo producto
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, marca o SKU" className="pl-9" aria-label="Buscar productos" />
        </div>
        <Select items={CAT_ITEMS} value={cat} onValueChange={(v) => setCat(v ?? "all")}>
          <SelectTrigger className="w-48" aria-label="Filtrar por categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CAT_ITEMS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Producto</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="hidden sm:table-cell">Estado</TableHead>
              <TableHead className="w-12 pr-4"><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => {
              const pricing = pricer(p)
              const stock = totalStock(p)
              return (
                <TableRow key={p.id}>
                  <TableCell className="pl-4">
                    <Link href={`/admin/productos/${p.id}`} className="flex items-center gap-3 hover:text-brand">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image src={p.images[0]} alt="" fill sizes="44px" className="object-cover" style={{ objectPosition: p.imagePosition }} />
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-64 truncate font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-mono">{productCode(p)}</span> · {p.brand}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{categoryLabel(p.category)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className={pricing.compareAt ? "text-brand" : undefined}>{formatCRC(pricing.price)}</span>
                    {pricing.compareAt && (
                      <span className="block text-xs text-muted-foreground line-through">{formatCRC(pricing.compareAt)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className={stock === 0 ? "text-destructive" : stock <= 6 ? "text-warning" : undefined}>{stock}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.featured && <Badge variant="secondary"><StarIcon className="fill-current" /> Destacado</Badge>}
                      {p.isDryx && <Badge variant="outline">Marca DRYX</Badge>}
                      {stock === 0 && <Badge variant="destructive">Agotado</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${p.name}`} />}>
                        <MoreHorizontalIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={`/admin/productos/${p.id}`} />}>
                          <PencilIcon /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleFeatured(p)}>
                          <StarIcon /> {p.featured ? "Quitar de destacados" : "Destacar en landing"}
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href={`/tienda/${p.slug}`} target="_blank" />}>
                          Ver en tienda
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setToDelete(p)}>
                          <Trash2Icon /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No hay productos que coincidan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quita del catálogo y de la tienda. Los pedidos ya registrados no cambian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (!toDelete) return
                productsStore.set((all) => all.filter((x) => x.id !== toDelete.id))
                toast.success(`${toDelete.name} eliminado`)
                setToDelete(null)
              }}
            >
              Eliminar producto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
