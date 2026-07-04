import { schemas } from "@workspace/api-client"
import { apiClient } from "./api-client"
import { cacheLife } from "next/cache"

export async function getProducts(
  filters?: NonNullable<
    Parameters<typeof apiClient.products_list>[0]
  >["queries"]
) {
  "use cache"
  cacheLife("hours")
  return apiClient.products_list({
    queries: {
      ...filters,
      status: [
        schemas.StatusEnum.Enum.active,
        schemas.StatusEnum.Enum.out_of_stock,
      ],
      limit: 10000,
    },
  })
}

export async function getCategory(slug: string) {
  "use cache"
  cacheLife("days")
  return apiClient.categories_retrieve({ params: { slug } })
}

export async function getBrand(slug: string) {
  "use cache"
  cacheLife("days")
  return apiClient.brands_retrieve({ params: { slug } })
}

export async function getProduct(slug: string) {
  "use cache"
  cacheLife("hours")
  return apiClient.products_retrieve({ params: { slug } })
}

export async function getAllCategories() {
  "use cache"
  cacheLife("days")
  return apiClient.categories_list_all()
}

export async function getAllBrands() {
  "use cache"
  cacheLife("days")
  return apiClient.brands_list_all()
}
