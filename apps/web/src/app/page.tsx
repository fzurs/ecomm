import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { ProductGridSkeleton, ProductsGrid } from "@/components/products-grid"
import { getProducts } from "@/lib/cache"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import { createLoader, parseAsString } from "nuqs/server"
import { Suspense } from "react"

const loadSearchParams = createLoader({
  search: parseAsString.withDefault(""),
})

export default async function ProductsPage(props: PageProps<"/">) {
  const searchParams = loadSearchParams(props.searchParams)

  return (
    <>
      <PageHeader breadcrumbs={{ page: "Home" }} />
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductList searchParams={searchParams} />
          </Suspense>
        </SidebarInset>
      </div>
    </>
  )
}

async function ProductList(props: {
  searchParams: ReturnType<typeof loadSearchParams>
}) {
  const { search } = await props.searchParams
  const products = await getProducts({ search: search || undefined })
  return <ProductsGrid products={products.results} />
}
