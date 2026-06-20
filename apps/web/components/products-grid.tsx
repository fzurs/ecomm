import { schemas } from "@workspace/api-client"
import Link from "next/link"
import { ProductCard } from "./product-card"

export function ProductsGrid({
  products,
}: {
  products: (typeof schemas.Product._type)[]
}) {
  return (
    <div className="@container/main flex flex-1">
      <div className="grid w-full grid-cols-1 gap-4 p-4 @2xl/main:grid-cols-2 @4xl/main:grid-cols-3">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.slug}`}>
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </div>
  )
}
