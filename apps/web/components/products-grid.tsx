import { schemas } from "@workspace/api-client"
import Link from "next/link"
import { ProductCard } from "./product-card"
import React from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"

function ProductGridWrapper({ children }: React.ComponentProps<"div">) {
  return (
    <div className="@container/main flex flex-1">
      <div className="grid w-full grid-cols-1 gap-4 p-4 @2xl/main:grid-cols-2 @4xl/main:grid-cols-3">
        {children}
      </div>
    </div>
  )
}

export function ProductsGrid({
  products,
}: {
  products: (typeof schemas.Product._type)[]
}) {
  return (
    <ProductGridWrapper>
      {products.map((product) => (
        <Link key={product.id} href={`/product/${product.slug}`}>
          <ProductCard product={product} />
        </Link>
      ))}
    </ProductGridWrapper>
  )
}

export function ProductGridSkeleton() {
  return (
    <ProductGridWrapper>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square size-full" />
      ))}
    </ProductGridWrapper>
  )
}
