import { isPromoLive } from "@/lib/pricing"
import type { Product, Promotion } from "@/lib/types"

/** Banner de la landing: la primera promo tipo banner, vigente y con foto. Sin ninguna, la sección se oculta. */
export function landingBanner(promotions: Promotion[], now: number) {
  return promotions.find((p) => p.type === "banner" && !!p.image && isPromoLive(p, now))
}

/** A dónde lleva el botón del banner, según a qué aplica la promo. */
export function promoHref(promo: Promotion, products: Product[]) {
  if (promo.target.kind === "category" && promo.target.ids[0]) return `/tienda?categoria=${promo.target.ids[0]}`
  if (promo.target.kind === "product") {
    const items = products.filter((p) => promo.target.ids.includes(p.id))
    if (items.length === 1) return `/tienda/${items[0].slug}`
    if (items.length > 1) {
      const params = new URLSearchParams()
      if (items.every((p) => p.category === items[0].category)) params.set("categoria", items[0].category)
      if (items.every((p) => p.brand === items[0].brand)) params.set("marca", items[0].brand)
      const qs = params.toString()
      return qs ? `/tienda?${qs}` : "/tienda"
    }
  }
  return "/tienda"
}

/** Productos destacados en el orden definido en el admin; los que no tienen orden van al final. */
export function featuredProducts(products: Product[], order: string[]) {
  const rank = (id: string) => {
    const i = order.indexOf(id)
    return i === -1 ? Number.MAX_SAFE_INTEGER : i
  }
  return products.filter((p) => p.featured).sort((a, b) => rank(a.id) - rank(b.id))
}
