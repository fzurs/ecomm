import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { ProductsGrid } from "@/components/products-grid"
import { apiClient } from "@/lib/api-client"
import { SidebarInset } from "@workspace/ui/components/sidebar"

export default async function CategoryPage(props: PageProps<"/[slug]">) {
  const params = await props.params
  const category = await apiClient.categories_retrieve({ params })
  const products = await apiClient.products_list({
    queries: { category: [category.slug as string] },
  })

  return (
    <>
      <PageHeader
        breadcrumbs={{
          items: [{ title: "Home", href: "/" }],
          page: category.name,
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
