"use client"

import { useSyncExternalStore } from "react"

let cartOpen = false
const listeners = new Set<() => void>()

export const cartUI = {
  open() {
    cartOpen = true
    listeners.forEach((l) => l())
  },
  set(v: boolean) {
    cartOpen = v
    listeners.forEach((l) => l())
  },
}

export function useCartOpen() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => cartOpen,
    () => false,
  )
}
