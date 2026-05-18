import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import { apiClient } from "./api-client"

export function useProducts(
  filters?: NonNullable<
    Parameters<typeof apiClient.products_list>[0]
  >["queries"]
) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () =>
      apiClient.products_list({
        queries: filters,
      }),
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
