import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { ProductsGrid } from "@/components/products-grid"
import { apiClient } from "@/lib/api-client"
import { schemas } from "@workspace/api-client"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import { createLoader, parseAsString } from "nuqs/server"

const loadSearchParams = createLoader({
  search: parseAsString,
})

export default async function ProductsPage(props: PageProps<"/">) {
  const searchParams = await loadSearchParams(props.searchParams)
  const products = await apiClient.products_list({
    queries: {
      search: searchParams.search || undefined,
      status: [
        schemas.StatusEnum.Enum.active,
        schemas.StatusEnum.Enum.out_of_stock,
      ],
      limit: 10000,
    },
  })

  return (
    <>
      <PageHeader breadcrumbs={{ page: "Home" }} />
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
          <ProductsGrid products={products.results} />
        </SidebarInset>
      </div>
    </>
  )
}
