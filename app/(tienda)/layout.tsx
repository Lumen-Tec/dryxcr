import { CartSheet } from "@/components/shop/cart-sheet"
import { SiteFooter } from "@/components/shop/site-footer"
import { SiteHeader } from "@/components/shop/site-header"

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartSheet />
    </>
  )
}
