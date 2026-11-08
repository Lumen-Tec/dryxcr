import { Suspense } from "react"
import { ProductForm } from "@/components/admin/product-form"

export default function EditProductPage({ params }: PageProps<"/admin/productos/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      {params.then(({ id }) => (
        <ProductForm productId={id} />
      ))}
    </Suspense>
  )
}
