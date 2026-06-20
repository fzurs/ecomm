import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { ProductsGrid } from "@/components/products-grid"
import { apiClient } from "@/lib/api-client"
import { SidebarInset } from "@workspace/ui/components/sidebar"

export default async function BrandPage(props: PageProps<"/brands/[slug]">) {
  const params = await props.params
  const brand = await apiClient.brands_retrieve({ params })
  const products = await apiClient.products_list({
    queries: { brand: [brand.slug as string] },
  })

  return (
    <>
      <PageHeader
        breadcrumbs={{
          items: [
            { title: "Home", href: "/" },
          ],
          page: brand.name,
        }}
      />
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
          <ProductsGrid products={products.results} />
        </SidebarInset>
      </div>
    </>
  )
}
