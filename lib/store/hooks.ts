"use client"

import { useCallback, useSyncExternalStore } from "react"
import { getPricing } from "@/lib/pricing"
import type { Product } from "@/lib/types"
import { usePromotions } from "./index"

/** Fecha fija para el prerender; en el navegador se usa la hora real. */
const SERVER_NOW = Date.parse("2026-11-08T12:00:00.000Z")
const clientNow = typeof window === "undefined" ? SERVER_NOW : Date.now()
const noop = () => () => {}

export function useNow() {
  return useSyncExternalStore(noop, () => clientNow, () => SERVER_NOW)
}

export function usePricer() {
  const promotions = usePromotions()
  const now = useNow()
  return useCallback((p: Product) => getPricing(p, promotions, now), [promotions, now])
}
