import { PageHeader } from "@/components/page-header"
import { ProductList } from "@/components/product-list"
import { ProductGridSkeleton } from "@/components/products-grid"
import { Suspense } from "react"

export default function ProductsPage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <PageHeader breadcrumbs={{ page: "Home" }} listsProducts />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductList pathname="/" searchParams={searchParams} />
      </Suspense>
    </>
  )
}
