import type { Metadata } from "next"
import { ProductDetail } from "@/components/shop/product-detail"
import { seedProducts } from "@/lib/data/products"

export function generateStaticParams() {
  return seedProducts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<"/tienda/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const p = seedProducts.find((x) => x.slug === slug)
  return p ? { title: p.name, description: p.description, openGraph: { images: [p.images[0]] } } : { title: "Producto" }
}

export default async function ProductPage({ params }: PageProps<"/tienda/[slug]">) {
  const { slug } = await params
  // El detalle se resuelve en el cliente para reflejar los cambios hechos en el panel admin (localStorage).
  return <ProductDetail key={slug} slug={slug} />
}
