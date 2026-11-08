"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLayoutEffect, useState } from "react"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sessionStore } from "@/lib/store"

const DEMO = { email: "admin@dryx.cr", password: "dryx2026" }

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState(DEMO.email)
  const [password, setPassword] = useState(DEMO.password)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Con Cache Components, Next oculta (no desmonta) esta ruta al navegar y conserva su estado.
  // Al ocultarse se resetea el formulario: así, tras cerrar sesión, el botón no queda en "Entrando…".
  useLayoutEffect(() => {
    return () => {
      setLoading(false)
      setError("")
      setEmail(DEMO.email)
      setPassword(DEMO.password)
    }
  }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim().toLowerCase() !== DEMO.email || password !== DEMO.password) {
      setError("Correo o contraseña incorrectos.")
      return
    }
    setLoading(true)
    sessionStore.set({ email: DEMO.email })
    router.replace("/admin")
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" aria-label="Volver a la tienda">
            <Logo className="text-4xl" />
          </Link>
          <h1 className="mt-10 font-display text-5xl">Panel admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Gestioná productos, inventario, promociones y pedidos.</p>

          <form onSubmit={submit} className="mt-8 grid gap-5" noValidate>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                aria-invalid={!!error}
                aria-describedby="login-error"
              />
            </div>
            {error && (
              <p id="login-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="h-11 text-base" disabled={loading} autoFocus>
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <Image src="/ig/p/tienda-caja.jpg" alt="" fill sizes="50vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
      </div>
    </div>
  )
}
