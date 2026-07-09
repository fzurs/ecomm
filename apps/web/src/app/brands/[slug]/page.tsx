import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { ProductsGrid } from "@/components/products-grid"
import { getBrand, getProducts } from "@/lib/cache"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import { notFound } from "next/navigation"

const breadcrumbs = {
  items: [
    { title: "Home", href: "/" },
    { title: "Brands", href: "/" },
  ],
}

export default async function BrandPage({
  params,
}: PageProps<"/brands/[slug]">) {
  const { slug } = await params
  const brand = await getBrand(slug)
  if (!brand) notFound()
  const products = await getProducts({ brand: [slug] })
  return (
    <>
      <PageHeader breadcrumbs={{ ...breadcrumbs, page: brand.name }} />
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
          <ProductsGrid products={products.results} />
        </SidebarInset>
      </div>
    </>
  )
}
