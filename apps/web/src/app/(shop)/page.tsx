import { ProductList } from "@/components/product-list"
import { ProductGridSkeleton } from "@/components/products-grid"
import { Suspense } from "react"

export default function ProductsPage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <div className="typeset">
        <h1>All products</h1>
      </div>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductList pathname="/" searchParams={searchParams} />
      </Suspense>
    </>
  )
}
