import { Suspense } from "react"
import BrandsProvider from "@/components/brands-provider"
import { CartProvider } from "@/components/cart-provider"
import CategoriesProvider from "@/components/categories-provider"
import { ProductGridSkeleton } from "@/components/products-grid"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { VisitorProvider } from "@/components/visitor-provider"
import { getAllBrands, getAllCategories } from "@/lib/cache"
import { getCart, getVisitor } from "@/lib/dal"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categoriesPromise = getAllCategories()
  const brandsPromise = getAllBrands()
  // Not awaited: the header resolves them inside a <Suspense>, so the rest of
  // the page doesn't wait for the session (and stays cached).
  const visitorPromise = getVisitor()
  const cartPromise = getCart()

  return (
    <CategoriesProvider categoriesPromise={categoriesPromise}>
      <BrandsProvider brandsPromise={brandsPromise}>
        <VisitorProvider visitorPromise={visitorPromise}>
          <CartProvider cartPromise={cartPromise}>
            <div className="flex min-h-svh flex-col">
              <SiteHeader />
              <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
                <Suspense fallback={<ProductGridSkeleton />}>
                  {children}
                </Suspense>
              </main>
              <SiteFooter />
            </div>
          </CartProvider>
        </VisitorProvider>
      </BrandsProvider>
    </CategoriesProvider>
  )
}
