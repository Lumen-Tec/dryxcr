"use client"

import { MenuIcon, ShoppingBagIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense, useState } from "react"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CATEGORIES } from "@/lib/data/products"
import { isPromoLive } from "@/lib/pricing"
import { useCart, usePromotions } from "@/lib/store"
import { useNow } from "@/lib/store/hooks"
import { cartUI } from "@/lib/store/ui"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/tienda", label: "Tienda" },
  ...CATEGORIES.map((c) => ({ href: `/tienda?categoria=${c.id}`, label: c.label })),
  { href: "/#ubicacion", label: "Ubicación" },
]

export function SiteHeader() {
  const items = useCart()
  const count = items.reduce((s, i) => s + i.qty, 0)
  const promos = usePromotions()
  const now = useNow()
  const live = promos.filter((p) => isPromoLive(p, now))
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40">
      {live.length > 0 && (
        <div className="overflow-hidden bg-brand text-brand-foreground">
          <div className="flex w-max animate-marquee gap-12 py-1.5 text-xs font-semibold tracking-wide whitespace-nowrap uppercase [--marquee-duration:40s]">
            {[0, 1].map((k) => (
              <div key={k} className="flex gap-12" aria-hidden={k === 1}>
                {[...live, ...live].map((p, i) => (
                  <span key={`${p.id}-${i}`}>
                    {p.title} <span className="opacity-60">·</span> {p.subtitle}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú" />}>
              <MenuIcon className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-6">
              <SheetTitle className="sr-only">Menú</SheetTitle>
              <Logo className="text-3xl" />
              <nav className="mt-6 flex flex-col">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setMenuOpen(false)}
                    className="border-b border-border py-3 font-display text-2xl"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" aria-label="DRYX, inicio" className="shrink-0">
            <Logo className="text-[1.7rem]" />
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Principal">
            <Suspense fallback={<NavLinks />}>
              <ActiveNavLinks />
            </Suspense>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon-lg" onClick={() => cartUI.open()} aria-label={`Carrito, ${count} productos`} className="relative">
              <ShoppingBagIcon className="size-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[0.7rem] leading-5 font-bold text-brand-foreground tabular-nums">
                  {count}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />
}

function NavLinks({ pathname }: { pathname?: string }) {
  return NAV.map((n) => (
    <Link
      key={n.href}
      href={n.href}
      aria-current={pathname === n.href ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
        pathname === n.href && "text-foreground",
      )}
    >
      {n.label}
    </Link>
  ))
}
