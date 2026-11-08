import { ClockIcon, ExternalLinkIcon, MapPinIcon, NavigationIcon } from "lucide-react"
import { WhatsAppIcon } from "@/components/brand/social-icons"
import { SOCIALS } from "@/components/shop/site-footer"
import { Button } from "@/components/ui/button"
import { mapsEmbedUrl, mapsLink, site, whatsappLink } from "@/lib/site"

export function Location() {
  const embedUrl = mapsEmbedUrl()
  return (
    <section id="ubicacion" className="scroll-mt-28 border-t border-border bg-card/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col">
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-brand uppercase">Visitanos</p>
          <h2 className="font-display text-5xl text-balance sm:text-6xl">En el corazón de Chepe</h2>
          <ul className="mt-8 space-y-5">
            <li className="flex gap-4">
              <MapPinIcon className="mt-0.5 size-5 shrink-0 text-brand" />
              <div>
                <p className="font-medium">{site.address}</p>
                <p className="text-sm text-muted-foreground">{site.addressHint}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <ClockIcon className="mt-0.5 size-5 shrink-0 text-brand" />
              <div className="text-sm">
                {site.hours.map((h) => (
                  <p key={h.days}>
                    <span className="font-medium">{h.days}</span>{" "}
                    <span className="text-muted-foreground tabular-nums">{h.time}</span>
                  </p>
                ))}
              </div>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="h-11" nativeButton={false} render={<a href={mapsLink} target="_blank" rel="noreferrer" />}>
              <NavigationIcon data-icon="inline-start" />
              Cómo llegar
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11"
              nativeButton={false}
              render={<a href={whatsappLink("¡Hola DRYX! Tengo una consulta 🙌")} target="_blank" rel="noreferrer" />}
            >
              <WhatsAppIcon className="size-4" data-icon="inline-start" />
              {site.whatsappDisplay}
            </Button>
          </div>
          <ul className="mt-auto grid grid-cols-2 gap-3 pt-10">
            {SOCIALS.map(({ href, label, handle, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-brand"
                >
                  <Icon className="size-5" />
                  <span className="grid text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="truncate text-xs text-muted-foreground">{handle}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative min-h-96 overflow-hidden rounded-2xl border border-border">
          {embedUrl ? (
            // Sin filtros CSS: las guías de Google prohíben cambiar los colores del mapa o tapar la atribución.
            <iframe
              title="Mapa de la tienda DRYX en San José"
              src={embedUrl}
              className="absolute inset-0 size-full"
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <a
              href={mapsLink}
              target="_blank"
              rel="noreferrer"
              className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card p-8 text-center transition-colors hover:bg-muted"
            >
              <span className="grid size-16 place-items-center rounded-full bg-brand/15">
                <MapPinIcon className="size-8 text-brand" />
              </span>
              <span className="font-display text-3xl">{site.address}</span>
              <span className="text-sm text-muted-foreground">{site.addressHint}</span>
              <span className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 group-hover:underline">
                Ver en Google Maps <ExternalLinkIcon className="size-4" />
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
