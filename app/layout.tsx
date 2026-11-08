import type { Metadata, Viewport } from "next"
import { Anton, Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { site } from "@/lib/site"
import "./globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] })
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] })

// En Vercel apunta al dominio de producción, así las vistas previas al compartir el link
// (WhatsApp, Instagram, Facebook) usan URLs absolutas correctas para las imágenes.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  openGraph: { images: ["/ig/p/tienda-caja.jpg"], locale: "es_CR", siteName: site.name },
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  icons: { icon: "/dryx-logo.jpg" },
}

export const viewport: Viewport = { themeColor: "#0b0b0b" }

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CR" className={`dark ${inter.variable} ${anton.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="bottom-center" theme="dark" richColors />
      </body>
    </html>
  )
}
