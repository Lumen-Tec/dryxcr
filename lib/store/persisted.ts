"use client"

import { useSyncExternalStore } from "react"

/**
 * Store mínimo persistido en localStorage.
 * En el servidor (y durante la hidratación) devuelve la semilla, luego el valor guardado.
 */
export function createPersistedStore<T>(key: string, seed: T) {
  let state: T = seed
  let loaded = false
  const listeners = new Set<() => void>()

  function load() {
    if (loaded || typeof window === "undefined") return
    loaded = true
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) state = JSON.parse(raw) as T
    } catch {
      /* almacenamiento bloqueado: seguimos con la semilla */
    }
  }

  function emit() {
    listeners.forEach((l) => l())
  }

  function set(next: T | ((prev: T) => T)) {
    load()
    state = typeof next === "function" ? (next as (prev: T) => T)(state) : next
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* ignorar */
    }
    emit()
  }

  function reset() {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignorar */
    }
    state = seed
    emit()
  }

  function subscribe(l: () => void) {
    listeners.add(l)
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        loaded = false
        load()
        emit()
      }
    }
    window.addEventListener("storage", onStorage)
    return () => {
      listeners.delete(l)
      window.removeEventListener("storage", onStorage)
    }
  }

  function get() {
    load()
    return state
  }

  function useStore() {
    return useSyncExternalStore(subscribe, get, () => seed)
  }

  return { get, set, reset, useStore }
}
