import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { ProductGridSkeleton, ProductsGrid } from "@/components/products-grid"
import { getCategory, getProducts } from "@/lib/cache"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import { Suspense } from "react"

const breadcrumbs = {
  items: [{ title: "Home", href: "/" }],
}

export default async function CategoryPage(props: PageProps<"/[slug]">) {
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
  const category = await getCategory(params.slug)
  return <PageHeader breadcrumbs={{ ...breadcrumbs, page: category.name }} />
}

function PageHeaderLoading() {
  return <PageHeader breadcrumbs={{ ...breadcrumbs, page: "..." }} />
}

async function ProductList(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const products = await getProducts({ category: [params.slug] })
  return <ProductsGrid products={products.results} />
}
