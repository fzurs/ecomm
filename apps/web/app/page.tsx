import { ProductCard } from "@/components/product-card"
import { apiClient } from "@/lib/api-client"
import { cacheLife, cacheTag } from "next/cache"
import Link from "next/link"

async function getProducts() {
  "use cache"
  cacheTag("products")
  cacheLife("days")
  return apiClient.products_list()
}

export default async function Page() {
  const products = await getProducts()

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4">
        {products.results.map((product) => (
          <Link key={product.id} href={`/product/${product.slug}`} prefetch>
            <ProductCard product={product} isLink />
          </Link>
        ))}
      </div>
    </div>
  )
}
