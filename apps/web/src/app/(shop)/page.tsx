import { PageTitle } from "@/components/page-title"
import { ProductList } from "@/components/product-list"
import { ProductGridSkeleton } from "@/components/products-grid"
import { Suspense } from "react"

export default function ProductsPage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <PageTitle title="All products" />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductList pathname="/" searchParams={searchParams} />
      </Suspense>
    </>
  )
}
