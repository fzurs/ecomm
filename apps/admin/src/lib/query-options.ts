import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import { apiClient } from "./api-client"
import { Option } from "@/types/data-table"

export const queryKeys = {
  allProducts: () => ["products"],
  getProducts: (
    queries: NonNullable<
      Parameters<typeof apiClient.products_list>[0]
    >["queries"] = {}
  ) => [...queryKeys.allProducts(), queries],
}

export function useProducts(
  queries?: Parameters<typeof queryKeys.getProducts>[0]
) {
  return useQuery({
    queryKey: queryKeys.getProducts(queries),
    queryFn: () => apiClient.products_list({ queries }),
    placeholderData: keepPreviousData,
  })
}

export function getCategoriesQueryOptions(
  filters?: NonNullable<
    Parameters<typeof apiClient.categories_list>[0]
  >["queries"]
) {
  return queryOptions({
    queryKey: ["products", filters],
    queryFn: () =>
      apiClient.categories_list({
        queries: filters,
      }),
    placeholderData: keepPreviousData,
  })
}

export function getCategoryQueryOptions(
  params: NonNullable<
    Parameters<typeof apiClient.categories_retrieve>[0]
  >["params"]
) {
  return queryOptions({
    queryKey: ["category", params],
    queryFn: () => apiClient.categories_retrieve({ params }),
  })
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => apiClient.auth_user_retrieve(),
    retry: false,
  })
}

export function getBrandsQueryOptions() {
  return queryOptions({
    queryKey: ["brands"],
    queryFn: () => apiClient.brands_list(),
  })
}

export function getBrandQueryOptions(
  params: NonNullable<Parameters<typeof apiClient.brands_retrieve>[0]>["params"]
) {
  return queryOptions({
    queryKey: ["brand", params],
    queryFn: () => apiClient.brands_retrieve({ params }),
  })
}

export const selectAsOption = (
  data: {
    slug?: string | null
    id: number
    name: string
  }[]
): Option[] =>
  data.map((item) => ({
    label: item.name,
    value: item.slug || item.id,
  }))
