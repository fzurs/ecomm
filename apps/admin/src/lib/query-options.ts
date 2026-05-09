import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import { apiClient } from "./api-client"

type ApiFilters<T extends (...args: any[]) => any> = NonNullable<
  Parameters<T>[0]
>["queries"]
type ProductFilters = ApiFilters<typeof apiClient.products_list>
type CategoryFilters = ApiFilters<typeof apiClient.categories_list>

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () =>
      apiClient.products_list({
        queries: filters,
      }),
    placeholderData: keepPreviousData,
  })
}

export function getCategoriesQueryOptions(filters?: CategoryFilters) {
  return queryOptions({
    queryKey: ["products", filters],
    queryFn: () =>
      apiClient.categories_list({
        queries: filters,
      }),
    placeholderData: keepPreviousData,
  })
}
