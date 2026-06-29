import {
  keepPreviousData,
  queryOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query"
import { apiClient } from "./api-client"
import { Option } from "@/types/data-table"
import { schemas } from "@workspace/api-client"
import z from "zod"

type ExtractQueries<T extends (...args: any[]) => any> =
  NonNullable<Parameters<T>[0]> extends { queries?: infer Q } ? Q : never

type ListQuery<T extends { list: (...args: any[]) => any }> = Parameters<
  T["list"]
>[0]

function createResourceKeys<T extends (...args: any[]) => any>(
  resource: string
) {
  return {
    all: () => [resource] as const,
    list: (filters?: ExtractQueries<T>) => [resource, "list", filters] as const,
  }
}

export const queryKeys = {
  products: createResourceKeys<typeof apiClient.products_list>("products"),
  categories:
    createResourceKeys<typeof apiClient.categories_list>("categories"),
  brands: createResourceKeys<typeof apiClient.brands_list>("brands"),
  session: { all: () => ["session"] as const },
}

export function useProducts(queries?: ListQuery<typeof queryKeys.products>) {
  return useQuery({
    queryKey: queryKeys.products.list(queries),
    queryFn: () => apiClient.products_list({ queries }),
    placeholderData: keepPreviousData,
  })
}

export function getCategoriesQueryOptions(
  queries?: ListQuery<typeof queryKeys.categories>
) {
  return queryOptions({
    queryKey: queryKeys.categories.list(queries),
    queryFn: () => apiClient.categories_list({ queries }),
    placeholderData: keepPreviousData,
  })
}

export const getCategoriesAllQueryOptions = queryOptions({
  queryKey: queryKeys.categories.all(),
  queryFn: () => apiClient.categories_list_all(),
})

export function getBrandsQueryOptions(
  queries?: ListQuery<typeof queryKeys.brands>
) {
  return queryOptions({
    queryKey: queryKeys.brands.list(queries),
    queryFn: () => apiClient.brands_list({ queries }),
    placeholderData: keepPreviousData,
  })
}

export const getBrandsAllQueryOptions = queryOptions({
  queryKey: queryKeys.brands.all(),
  queryFn: () => apiClient.brands_list_all(),
})

export function useSession(
  options?: Omit<
    UseQueryOptions<z.infer<typeof schemas.UserDetails>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: queryKeys.session.all(),
    queryFn: () => apiClient.auth_user_retrieve(),
    retry: false,
    ...options,
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
