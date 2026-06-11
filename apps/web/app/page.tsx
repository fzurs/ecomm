import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { apiClient } from "@/lib/api-client"
import { schemas } from "@workspace/api-client"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { parseAsString, createSearchParamsCache } from "nuqs/server"
import { Suspense } from "react"

const searchParamsCache = createSearchParamsCache({
  search: parseAsString.withDefault(""),
})

export default async function Page(props: PageProps<"/">) {
  const params = await searchParamsCache.parse(props.searchParams)

  return (
    <>
      <PageHeader breadcrumbs={{ page: "Products" }} />
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
          <div className="@container/main flex-1">
            <div className="grid grid-cols-1 gap-4 p-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
              <Suspense fallback={<div>Loading...</div>}>
                <ProductList search={params.search} />
              </Suspense>
            </div>
          </div>
        </SidebarInset>
      </div>
    </>
  )
}

async function ProductList({ search }: { search?: string }) {
  "use cache"
  const products = await apiClient.products_list({
    queries: {
      search,
      status: [
        schemas.StatusEnum.Enum.active,
        schemas.StatusEnum.Enum.out_of_stock,
      ],
    },
  })

  return products.results.map((product) => (
    <Link key={product.id} href={`/product/${product.slug}`} prefetch>
      <ProductCard product={product} />
    </Link>
  ))
}
