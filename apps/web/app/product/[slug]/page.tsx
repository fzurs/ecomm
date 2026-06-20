"use cache"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { getProduct } from "@/lib/cache"
import { SidebarInset } from "@workspace/ui/components/sidebar"

export default async function ProductPage(props: PageProps<"/[slug]">) {
  const params = await props.params
  const product = await getProduct(params.slug)

  return (
    <>
      <PageHeader
        breadcrumbs={{
          items: [{ title: "Home", href: "/" }],
          page: product.name,
        }}
      />
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
          <ProductCard
            product={product}
            className="flex aspect-auto border-0"
          />
        </SidebarInset>
      </div>
    </>
  )
}
