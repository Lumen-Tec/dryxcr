"use client"

import {
  BoxesIcon,
  ExternalLinkIcon,
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  LogOutIcon,
  PackageIcon,
  ReceiptTextIcon,
  RotateCcwIcon,
  TagIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useSyncExternalStore } from "react"
import { toast } from "sonner"
import { Logo } from "@/components/brand/logo"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { LOW_STOCK } from "@/lib/pricing"
import { resetDemoData, sessionStore, useOrders, useProducts, useSession } from "@/lib/store"

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboardIcon },
  { href: "/admin/pedidos", label: "Pedidos", Icon: ReceiptTextIcon, badge: "orders" },
  { href: "/admin/productos", label: "Productos", Icon: PackageIcon },
  { href: "/admin/inventario", label: "Inventario", Icon: BoxesIcon, badge: "stock" },
  { href: "/admin/promociones", label: "Promociones", Icon: TagIcon },
  { href: "/admin/landing", label: "Página de inicio", Icon: LayoutTemplateIcon },
] as const

const noop = () => () => {}
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false)

export function AdminShell({ children }: { children: React.ReactNode }) {
  const session = useSession()
  const hydrated = useHydrated()
  const router = useRouter()
  const pathname = usePathname()
  const orders = useOrders()
  const products = useProducts()

  useEffect(() => {
    if (hydrated && !session) router.replace("/admin/login")
  }, [hydrated, session, router])

  // En el servidor (y durante la hidratación) siempre se renderiza el shell con la página:
  // así Next puede prerenderizar el segmento y validar la navegación instantánea.
  // Recién en el navegador, si no hay sesión, se oculta y se redirige al login.
  if (hydrated && !session) {
    return (
      <div className="grid min-h-svh place-items-center" aria-busy>
        <Logo className="animate-pulse text-5xl" />
      </div>
    )
  }

  const badges = {
    orders: orders.filter((o) => o.status === "nuevo").length,
    stock: products.flatMap((p) => p.variants).filter((v) => v.stock <= LOW_STOCK).length,
  }
  const current = NAV.find((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)))

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-16 justify-center px-4 group-data-[collapsible=icon]:px-2">
          <Link href="/admin" className="flex items-baseline gap-2">
            <Logo className="text-2xl group-data-[collapsible=icon]:text-base" />
            <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">Admin</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map(({ href, label, Icon, ...rest }) => {
                  const badge = "badge" in rest ? badges[rest.badge] : 0
                  return (
                    <SidebarMenuItem key={href}>
                      <NavLink href={href} label={label} active={current?.href === href}>
                        <Icon />
                      </NavLink>
                      {badge > 0 && <SidebarMenuBadge className="bg-brand/20 text-foreground">{badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Ver tienda" render={<Link href="/" target="_blank" />}>
                <ExternalLinkIcon />
                <span>Ver tienda</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Restaurar datos demo"
                onClick={() => {
                  resetDemoData()
                  toast.success("Datos de demo restaurados")
                }}
              >
                <RotateCcwIcon />
                <span>Restaurar datos demo</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Cerrar sesión"
                onClick={() => {
                  sessionStore.set(null)
                  router.replace("/admin/login")
                }}
              >
                <LogOutIcon />
                <span>Cerrar sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-sm font-medium">{current?.label ?? "Admin"}</h1>
          <span className="ml-auto truncate text-xs text-muted-foreground">{session?.email ?? "admin@dryx.cr"}</span>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

/** Link del menú lateral: en móvil cierra el panel al navegar (si no, queda abierto sobre la página nueva). */
function NavLink({ href, label, active, children }: { href: string; label: string; active: boolean; children: React.ReactNode }) {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenuButton isActive={active} tooltip={label} render={<Link href={href} onClick={() => setOpenMobile(false)} />}>
      {children}
      <span>{label}</span>
    </SidebarMenuButton>
  )
}
