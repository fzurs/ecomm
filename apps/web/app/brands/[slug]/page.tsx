"use cache"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { ProductGridSkeleton, ProductsGrid } from "@/components/products-grid"
import { getBrand, getProducts } from "@/lib/cache"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import { Suspense } from "react"

const breadcrumbs = {
  items: [
    { title: "Home", href: "/" },
    { title: "Brands", href: "/" },
  ],
}

export default async function BrandPage(props: PageProps<"/brands/[slug]">) {
  return (
    <>
      <Suspense fallback={<PageHeaderLoading />}>
        <PageHeaderHeading params={props.params} />
      </Suspense>
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductList params={props.params} />
          </Suspense>
        </SidebarInset>
      </div>
    </>
  )
}

async function PageHeaderHeading(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const brand = await getBrand(params.slug)
  return <PageHeader breadcrumbs={{ ...breadcrumbs, page: brand.name }} />
}

function PageHeaderLoading() {
  return <PageHeader breadcrumbs={{ ...breadcrumbs, page: "..." }} />
}

async function ProductList(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const products = await getProducts({ brand: [params.slug] })
  return <ProductsGrid products={products.results} />
}
