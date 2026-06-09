import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { apiClient } from "@/lib/api-client"
import { SidebarInset } from "@workspace/ui/components/sidebar"

export default async function ProductPage(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const product = await apiClient.products_retrieve({ params })
  return (
    <>
      <PageHeader
        breadcrumbs={{
          items: [{ href: "/", title: "Products" }],
          page: product.name,
        }}
      />
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
          <ProductCard product={product} className="border-none shadow-none" />
        </SidebarInset>
      </div>
    </>
  )
}
