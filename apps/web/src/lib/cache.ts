import {
  brandsListAll,
  brandsRetrieve,
  categoriesListAll,
  categoriesRetrieve,
  productsList,
  ProductsListData,
  productsRetrieve,
} from "@workspace/api-client"
import { cacheLife } from "next/cache"

const defaultConfig = { baseURL: "http://localhost:8000", throwOnError: true } as const

export async function getProducts(filters?: ProductsListData["query"]) {
  "use cache"
  cacheLife("hours")

  return productsList({
    ...defaultConfig,
    query: {
      ...filters,
      status: ["active", "out_of_stock"],
      limit: 10000,
    },
  }).then((res) => res.data)
}

export async function getCategory(slug: string) {
  "use cache"
  cacheLife("days")
  return categoriesRetrieve({ ...defaultConfig, path: { slug } }).then(
    (res) => res.data
  )
}

export async function getBrand(slug: string) {
  "use cache"
  cacheLife("days")
  return brandsRetrieve({ ...defaultConfig, path: { slug } }).then(
    (res) => res.data
  )
}

export async function getProduct(slug: string) {
  "use cache"
  cacheLife("hours")
  return productsRetrieve({ ...defaultConfig, path: { slug } }).then(
    (res) => res.data
  )
}

export async function getAllCategories() {
  "use cache"
  cacheLife("days")
  return categoriesListAll(defaultConfig).then((res) => res.data)
}

export async function getAllBrands() {
  "use cache"
  cacheLife("days")
  return brandsListAll(defaultConfig).then((res) => res.data)
}
