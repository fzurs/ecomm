import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { apiClient } from "@/lib/api-client"
import { schemas } from "@workspace/api-client"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import { Skeleton } from "@workspace/ui/components/skeleton"
import Link from "next/link"
import {
  parseAsString,
  createSearchParamsCache,
  SearchParams,
} from "nuqs/server"
import { Suspense } from "react"

const searchParamsCache = createSearchParamsCache({
  search: parseAsString.withDefault(""),
})

export default function Page(props: PageProps<"/">) {
  return (
    <>
      <PageHeader breadcrumbs={{ page: "Products" }} />
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
          <div className="@container/main flex-1">
            <div className="grid grid-cols-1 gap-4 p-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
              <Suspense fallback={<ProductListSkeleton />}>
                <ProductList searchParams={props.searchParams} />
              </Suspense>
            </div>
          </div>
        </SidebarInset>
      </div>
    </>
  )
}

async function ProductList(props: { searchParams: Promise<SearchParams> }) {
  "use cache"

  const searchParams = await searchParamsCache.parse(props.searchParams)

  const products = await apiClient.products_list({
    queries: {
      search: searchParams?.search ?? "",
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

function ProductListSkeleton() {
  return Array.from({ length: 5 }).map((_, index) => (
    <Skeleton key={index} className="h-40 w-full" />
  ))
}
