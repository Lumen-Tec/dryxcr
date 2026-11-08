"use client"

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatCRC } from "@/lib/format"
import { totalStock } from "@/lib/pricing"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

/** SKU del producto (editable en el admin). */
export const productCode = (p: Pick<Product, "id" | "sku">) => p.sku || p.id.toUpperCase()

/** Buscador de productos por nombre, marca o código. */
export function ProductPicker({
  products,
  value,
  onChange,
  priceOf,
}: {
  products: Product[]
  value: string | null
  onChange: (id: string) => void
  priceOf: (p: Product) => number
}) {
  const [open, setOpen] = useState(false)
  const selected = products.find((p) => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Producto"
            className="w-full justify-between font-normal"
          />
        }
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 font-mono text-xs text-muted-foreground">{productCode(selected)}</span>
            <span className="truncate">{selected.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Buscar producto…</span>
        )}
        <ChevronsUpDownIcon className="text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) min-w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Nombre, marca o SKU (ej. NB-550)" />
          <CommandList>
            <CommandEmpty>Ningún producto coincide.</CommandEmpty>
            {products.map((p) => {
              const stock = totalStock(p)
              return (
                <CommandItem
                  key={p.id}
                  value={p.id}
                  keywords={[productCode(p), p.name, p.brand]}
                  disabled={stock === 0}
                  onSelect={() => {
                    onChange(p.id)
                    setOpen(false)
                  }}
                  className="gap-3"
                >
                  <div className="relative size-9 shrink-0 overflow-hidden rounded bg-muted">
                    <Image src={p.images[0]} alt="" fill sizes="36px" className="object-cover" style={{ objectPosition: p.imagePosition }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{productCode(p)}</span> · {p.brand} · {stock === 0 ? "Agotado" : `${stock} disp.`}
                    </p>
                  </div>
                  <span className="text-xs tabular-nums">{formatCRC(priceOf(p))}</span>
                  <CheckIcon className={cn("size-4", value === p.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
