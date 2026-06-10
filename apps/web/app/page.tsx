import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { apiClient } from "@/lib/api-client"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
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
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <Suspense fallback={<div>Loading...</div>}>
              <ProductList {...params} />
            </Suspense>
          </div>
        </SidebarInset>
      </div>
    </>
  )
}

async function ProductList({ search }: { search?: string }) {
  "use cache"
  const products = await apiClient.products_list({ queries: { search } })

  return products.results.map((product) => (
    <Link key={product.id} href={`/product/${product.slug}`} prefetch>
      <ProductCard
        product={product}
        className={cn(
          product.brand?.slug === "intel"
            ? "hover:border-blue-500"
            : "hover:border-orange-500",
          "h-full transition-colors"
        )}
      />
    </Link>
  ))
}
