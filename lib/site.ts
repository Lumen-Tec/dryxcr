export const site = {
  name: "DRYX",
  tagline: "Tu estilo, tu potencia",
  description:
    "Ropa y calzado deportivo en San José. Marca 100 % nacional y las marcas más reconocidas del mundo.",
  whatsapp: "50670174429",
  whatsappDisplay: "+506 7017-4429",
  email: "dryxcrterramall@gmail.com",
  address: "Avenida Central, calle 1, San José",
  addressHint: "100 m al oeste de la Plaza de la Cultura",
  coords: { lat: 9.933997912372526, lng: -84.077989389216 },
  hours: [{ days: "Lunes a domingo", time: "10:00 a. m. – 7:00 p. m." }],
  social: {
    instagram: "https://www.instagram.com/dryx.cr",
    facebook: "https://www.facebook.com/DRYXCR/",
    tiktok: "https://www.tiktok.com/@dryxcr",
  },
} as const

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${site.whatsapp}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${site.coords.lat},${site.coords.lng}`
/**
 * Mapa con el Maps Embed API oficial (gratis y sin límite de uso, pero requiere API key).
 * La key va en NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY (.env.local). Sin key devuelve null y la
 * landing muestra una tarjeta con la dirección en lugar del iframe.
 */
export function mapsEmbedUrl() {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY
  if (!key) return null
  const params = new URLSearchParams({
    key,
    q: `${site.coords.lat},${site.coords.lng}`,
    zoom: "17",
    language: "es",
    region: "CR",
  })
  return `https://www.google.com/maps/embed/v1/place?${params}`
}
