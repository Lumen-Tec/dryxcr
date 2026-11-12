export type Category = "sneakers" | "ropa" | "gorras" | "accesorios"

export interface Variant {
  id: string
  color: string
  size: string
  stock: number
}

export interface Product {
  id: string
  slug: string
  /** Código interno editable (único). Ej.: NB-550, DRX-DRYCOOL. */
  sku: string
  name: string
  brand: string
  category: Category
  description: string
  /** Precio actual de venta (₡). */
  price: number
  /** Precio anterior; si existe y es mayor, el producto se muestra en oferta. */
  compareAtPrice?: number
  images: string[]
  /** CSS object-position para recortar las fotos verticales de IG. */
  imagePosition?: string
  tags: string[]
  featured: boolean
  isDryx: boolean
  variants: Variant[]
  createdAt: string
}

export type PromotionType = "banner" | "percent" | "fixed"

export interface Promotion {
  id: string
  title: string
  subtitle: string
  type: PromotionType
  /** percent: 0-100 · fixed: monto en ₡ a descontar. */
  value?: number
  target: { kind: "all" | "category" | "product"; ids: string[] }
  startsAt: string
  endsAt: string
  active: boolean
  /** Solo banners: con foto, la promo sale como banner grande en la landing. */
  image?: string
  /** CSS object-position de la foto del banner. */
  imagePosition?: string
  /** Texto del botón del banner. El enlace se deduce de `target`. */
  cta?: string
}

export interface LandingVideo {
  src: string
  poster: string
}

/** Contenido editable de la landing. Espacios fijos: el admin llena casillas, no arma la página. */
export interface LandingContent {
  hero: LandingVideo
  /** Siempre 4 espacios. */
  reels: (LandingVideo & { caption: string })[]
  brands: string[]
  /** Orden de los productos destacados (ids). Los que no estén acá van al final. */
  featuredOrder: string[]
}

export type OrderStatus = "nuevo" | "pagado" | "enviado" | "entregado" | "cancelado"

export interface OrderItem {
  productId: string
  name: string
  variantLabel: string
  qty: number
  unitPrice: number
}

export interface Order {
  id: string
  number: number
  customer: string
  phone: string
  channel: "whatsapp" | "tienda" | "instagram"
  delivery: "pickup" | "shipping"
  province?: string
  canton?: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: string
  notes?: string
}

export interface CartItem {
  productId: string
  variantId: string
  qty: number
}
