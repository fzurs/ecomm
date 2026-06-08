import { ProductCard } from "@/components/product-card"
import { apiClient } from "@/lib/api-client"
import { cacheLife, cacheTag } from "next/cache"

async function getProduct(
  params: Parameters<typeof apiClient.products_retrieve>[0]["params"]
) {
  "use cache"
  cacheTag("products")
  cacheLife("days")
  return apiClient.products_retrieve({ params })
}

export default async function ProductPage(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const product = await getProduct(params)

  return <ProductCard product={product} />
}
