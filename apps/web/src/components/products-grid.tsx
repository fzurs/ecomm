import { Product } from "@workspace/api-client"
import { Skeleton } from "@workspace/ui/components/skeleton"
import Link from "next/link"
import React from "react"
import { ProductCard } from "./product-card"

function ProductGridWrapper({ children }: React.ComponentProps<"div">) {
  return (
    <div className="@container/grid">
      <div className="grid grid-cols-1 gap-4 @sm/grid:grid-cols-2 @2xl/grid:grid-cols-3 @5xl/grid:grid-cols-4">
        {children}
      </div>
    </div>
  )
}

export function ProductsGrid({ products }: { products: Product[] }) {
  return (
    <ProductGridWrapper>
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.slug}`}
          className="group/product rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ProductCard
            product={product}
            className="transition-shadow group-hover/product:shadow-md"
          />
        </Link>
      ))}
    </ProductGridWrapper>
  )
}

export function ProductGridSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-64" />
      </div>
      <ProductGridWrapper>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl p-4 ring-1 ring-foreground/10"
          >
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ))}
      </ProductGridWrapper>
    </div>
  )
}
