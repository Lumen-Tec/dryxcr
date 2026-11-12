"use client"

import { seedOrders } from "@/lib/data/orders"
import { seedProducts } from "@/lib/data/products"
import { seedPromotions } from "@/lib/data/promotions"
import { seedLanding } from "@/lib/data/landing"
import type { CartItem, LandingContent, Order, Product, Promotion } from "@/lib/types"
import { createPersistedStore } from "./persisted"

export const productsStore = createPersistedStore<Product[]>("dryx:products:v2", seedProducts)
export const promotionsStore = createPersistedStore<Promotion[]>("dryx:promotions:v2", seedPromotions)
export const landingStore = createPersistedStore<LandingContent>("dryx:landing:v1", seedLanding)
export const ordersStore = createPersistedStore<Order[]>("dryx:orders:v1", seedOrders)
export const cartStore = createPersistedStore<CartItem[]>("dryx:cart:v1", [])
export const sessionStore = createPersistedStore<{ email: string } | null>("dryx:session:v1", null)

export const useProducts = productsStore.useStore
export const usePromotions = promotionsStore.useStore
export const useLanding = landingStore.useStore
export const useOrders = ordersStore.useStore
export const useCart = cartStore.useStore
export const useSession = sessionStore.useStore

export function resetDemoData() {
  productsStore.reset()
  promotionsStore.reset()
  ordersStore.reset()
  landingStore.reset()
}

/* ───────── Carrito ───────── */

export const cart = {
  add(productId: string, variantId: string, qty = 1) {
    cartStore.set((items) => {
      const found = items.find((i) => i.variantId === variantId)
      if (found) return items.map((i) => (i === found ? { ...i, qty: i.qty + qty } : i))
      return [...items, { productId, variantId, qty }]
    })
  },
  setQty(variantId: string, qty: number) {
    cartStore.set((items) =>
      qty <= 0 ? items.filter((i) => i.variantId !== variantId) : items.map((i) => (i.variantId === variantId ? { ...i, qty } : i)),
    )
  },
  remove(variantId: string) {
    cartStore.set((items) => items.filter((i) => i.variantId !== variantId))
  },
  clear() {
    cartStore.set([])
  },
}
