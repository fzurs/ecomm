import {
  brandsListChoices,
  categoriesListChoices,
  categoriesRetrieve,
  productsList,
  productsListChoices,
  ProductsListData,
  productsRetrieve,
} from "@workspace/api-client"
import { getAllauthBrowserV1Config } from "@workspace/api-client/allauth"
import { cacheLife } from "next/cache"
import { API_URL } from "@/lib/django"

// Public data, the same for every visitor: cached across requests. What
// depends on the visitor's session is in src/lib/dal.ts.
const defaultConfig = {
  baseURL: API_URL,
  throwOnError: true,
} as const

/** A page of the catalog: the API only shows products for sale here. */
export async function getProducts(query: ProductsListData["query"]) {
  "use cache"
  cacheLife("hours")

  return productsList({ ...defaultConfig, query }).then((res) => res.data)
}

/** Every product's slug, to prerender their pages in the build. */
export async function getProductSlugs() {
  "use cache"
  cacheLife("hours")
  return productsListChoices(defaultConfig).then((res) =>
    res.data.map((product) => product.slug)
  )
}

export async function getCategory(slug: string) {
  "use cache"
  cacheLife("days")
  const res = await categoriesRetrieve({
    ...defaultConfig,
    throwOnError: false,
    path: { slug },
  })
  if (res.status === 404) return null
  if (!res.data) throw res.error
  return res.data
}

export async function getProduct(slug: string) {
  "use cache"
  cacheLife("hours")
  const res = await productsRetrieve({
    ...defaultConfig,
    throwOnError: false,
    path: { slug },
  })
  if (res.status === 404) return null
  if (!res.data) throw res.error
  return res.data
}

export async function getAllCategories() {
  "use cache"
  cacheLife("days")
  return categoriesListChoices(defaultConfig).then((res) => res.data)
}

export async function getAllBrands() {
  "use cache"
  cacheLife("days")
  return brandsListChoices(defaultConfig).then((res) => res.data)
}

/**
 * The client ID of the Google login the API is configured with (allauth's
 * config), or null: then the store shows no Google button.
 */
export async function getGoogleClientId() {
  "use cache"
  cacheLife("hours")
  const { data } = await getAllauthBrowserV1Config(defaultConfig)
  const google = data.data.socialaccount?.providers.find(
    (provider) => provider.id === "google"
  )
  return google?.client_id ?? null
}
