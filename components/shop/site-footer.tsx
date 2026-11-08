import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/brand/social-icons"
import { CATEGORIES } from "@/lib/data/products"
import { mapsLink, site, whatsappLink } from "@/lib/site"

export const SOCIALS = [
  { href: site.social.instagram, label: "Instagram", handle: "@dryx.cr", Icon: InstagramIcon },
  { href: site.social.tiktok, label: "TikTok", handle: "@dryxcr", Icon: TikTokIcon },
  { href: site.social.facebook, label: "Facebook", handle: "/DRYXCR", Icon: FacebookIcon },
  { href: whatsappLink(), label: "WhatsApp", handle: site.whatsappDisplay, Icon: WhatsAppIcon },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo className="text-4xl" />
          <p className="max-w-xs text-sm text-pretty text-muted-foreground">{site.description}</p>
          <div className="flex gap-2">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Tienda</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/tienda" className="hover:text-brand">Todo el catálogo</Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/tienda?categoria=${c.id}`} className="hover:text-brand">{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Visitanos</h3>
          <address className="space-y-1 text-sm not-italic">
            <a href={mapsLink} target="_blank" rel="noreferrer" className="block hover:text-brand">
              {site.address}
            </a>
            <span className="block text-muted-foreground">{site.addressHint}</span>
            {site.hours.map((h) => (
              <span key={h.days} className="block text-muted-foreground">
                {h.days}: {h.time}
              </span>
            ))}
          </address>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Ayuda</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Envíos a todo Costa Rica por Correos de CR</li>
            <li>Cambios únicamente por talla</li>
            <li>Productos 100 % originales</li>
            <li>
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="text-foreground hover:text-brand">
                Escribinos: {site.whatsappDisplay}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <span>© 2026 DRYX · Marca 100 % nacional</span>
          <Link href="/admin" className="hover:text-foreground">Panel de administración</Link>
        </div>
      </div>
    </footer>
  )
}
