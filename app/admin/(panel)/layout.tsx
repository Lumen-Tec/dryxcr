import type { Metadata } from "next"
import { Suspense } from "react"
import { Logo } from "@/components/brand/logo"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin DRYX" }, robots: { index: false } }

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-svh place-items-center" aria-busy>
          <Logo className="animate-pulse text-5xl" />
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  )
}
