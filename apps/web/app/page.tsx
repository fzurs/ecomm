import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { apiClient } from "@/lib/api-client"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search: string }>
}) {
  const { search } = await searchParams
  const products = await apiClient.products_list({ queries: { search } })

  return (
    <>
      <PageHeader breadcrumbs={{ page: "Products" }} />
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {products.results.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} prefetch>
                <ProductCard
                  product={product}
                  className={cn(
                    product.brand?.slug === "intel"
                      ? "hover:border-blue-500"
                      : "hover:border-orange-500",
                    "transition-colors h-full"
                  )}
                />
              </Link>
            ))}
          </div>
        </SidebarInset>
      </div>
    </>
  )
}
