import type { Product, Promotion } from "@/lib/types"

export function isPromoLive(p: Promotion, now: number) {
  return p.active && Date.parse(p.startsAt) <= now && now <= Date.parse(p.endsAt)
}

export function promoApplies(p: Promotion, product: Product) {
  if (p.target.kind === "all") return true
  if (p.target.kind === "category") return p.target.ids.includes(product.category)
  return p.target.ids.includes(product.id)
}

export interface Pricing {
  price: number
  compareAt?: number
  /** % de descuento redondeado, si aplica. */
  discount?: number
  promo?: Promotion
}

/**
 * Precio final: el menor entre el precio del producto y los descuentos activos (% o monto fijo).
 * Los banners no alteran el precio: se negocian en tienda/WhatsApp.
 */
export function getPricing(product: Product, promotions: Promotion[], now: number): Pricing {
  let price = product.price
  let promo: Promotion | undefined
  for (const p of promotions) {
    if (p.type === "banner" || !isPromoLive(p, now) || !promoApplies(p, product) || !p.value) continue
    const candidate = p.type === "percent" ? Math.round((product.price * (100 - p.value)) / 100 / 100) * 100 : product.price - p.value
    if (candidate < price) {
      price = Math.max(0, candidate)
      promo = p
    }
  }
  const reference = Math.max(product.compareAtPrice ?? 0, product.price)
  const compareAt = reference > price ? reference : undefined
  const discount = compareAt ? Math.round((1 - price / compareAt) * 100) : undefined
  return { price, compareAt, discount, promo }
}

export const totalStock = (p: Product) => p.variants.reduce((s, v) => s + v.stock, 0)

export const LOW_STOCK = 2
