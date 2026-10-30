import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { Suspense } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import BrandsProvider from "@/components/brands-provider"
import CategoriesProvider from "@/components/categories-provider"
import { PageHeader } from "@/components/page-header"
import { ProductGridSkeleton } from "@/components/products-grid"
import { VisitorProvider } from "@/components/visitor-provider"
import { getAllBrands, getAllCategories } from "@/lib/cache"
import { getVisitor } from "@/lib/dal"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categoriesPromise = getAllCategories()
  const brandsPromise = getAllBrands()
  // Not awaited: the header resolves it inside a <Suspense>, so the rest of
  // the page doesn't wait for the session (and stays cached).
  const visitorPromise = getVisitor()

  return (
    <SidebarProvider className="flex flex-col">
      <CategoriesProvider categoriesPromise={categoriesPromise}>
        <BrandsProvider brandsPromise={brandsPromise}>
          <VisitorProvider visitorPromise={visitorPromise}>
            <div className="flex flex-1 [--header-height:calc(--spacing(12))]">
              <AppSidebar />
              <SidebarInset className="mt-(--header-height)">
                <Suspense
                  fallback={
                    <>
                      <PageHeader />
                      <ProductGridSkeleton />
                    </>
                  }
                >
                  {children}
                </Suspense>
              </SidebarInset>
            </div>
          </VisitorProvider>
        </BrandsProvider>
      </CategoriesProvider>
    </SidebarProvider>
  )
}
