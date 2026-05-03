import { apiClient } from "@/lib/api-client";
import { Option } from "@/types/data-table";
import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { schemas } from "@workspace/api-client";
import z from "zod";

type NullableProps<T> = { [K in keyof T]: T[K] | null };

type NullToUndefined<T> = {
  [K in keyof T]: Exclude<T[K], null> | undefined;
};

function nullsToUndefined<T extends Record<string, any>>(
  params: T,
): NullToUndefined<T> {
  const result = {} as NullToUndefined<T>;

  for (const key in params) {
    const value = params[key];
    result[key] = (value === null ? undefined : value) as any;
  }

  return result;
}

type ListQueryFilters<T extends (...args: any) => any> = NullableProps<
  NonNullable<NonNullable<Parameters<T>[0]>["queries"]>
>;

export function getProductsQueryOptions(
  params: ListQueryFilters<typeof apiClient.products_list> = {},
) {
  const queries = nullsToUndefined(params);
  return queryOptions({
    queryKey: ["products", "list", queries],
    queryFn: () => apiClient.products_list({ queries }),
    placeholderData: keepPreviousData,
  });
}
export function useProducts(
  params: Parameters<typeof getProductsQueryOptions>[0] = {},
) {
  return useQuery(getProductsQueryOptions(params));
}

export function getCategoriesQueryOptions(
  params: ListQueryFilters<typeof apiClient.categories_list> = {},
) {
  const queries = nullsToUndefined(params);

  return queryOptions({
    queryKey: ["categories", "list", queries],
    queryFn: () => apiClient.categories_list({ queries }),
    placeholderData: keepPreviousData,
  });
}
export function useCategories(
  params: Parameters<typeof getCategoriesQueryOptions>[0] = {},
) {
  return useQuery(getCategoriesQueryOptions(params));
}

export function getProductsAsOptions({
  search,
  pageSize = 10,
}: {
  search?: string;
  pageSize?: number;
}) {
  return infiniteQueryOptions({
    queryKey: ["products", "list", "options", { search, pageSize }],
    queryFn: ({ pageParam }) =>
      apiClient.products_list({
        queries: { search, limit: pageSize, offset: pageParam * pageSize },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length : undefined,
    select: (data) =>
      data.pages.flatMap((page) =>
        page.results.map(
          (item) =>
            ({ label: item.name, value: item.id.toString() }) satisfies Option,
        ),
      ),
  });
}
export function getProductAsOption(value: string) {
  return queryOptions({
    queryKey: ["products", "retrive", "options", value],
    queryFn: () =>
      apiClient.products_retrieve({ params: { id: Number(value) } }),
    select: (data) =>
      ({ label: data.name, value: data.id.toString() }) satisfies Option,
  });
}

export function getCategoriesAsOptions({
  search,
  pageSize = 10,
}: {
  search?: string;
  pageSize?: number;
}) {
  return infiniteQueryOptions({
    queryKey: ["categories", "list", "options", { search, pageSize }],
    queryFn: ({ pageParam }) =>
      apiClient.categories_list({
        queries: { search, limit: pageSize, offset: pageParam * pageSize },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length : undefined,
    select: (data) =>
      data.pages.flatMap((page) =>
        page.results.map(
          (item) =>
            ({ label: item.name, value: item.id.toString() }) satisfies Option,
        ),
      ),
  });
}
export function getCategoryAsOption(value: string) {
  return queryOptions({
    queryKey: ["categories", "retrive", "options", value],
    queryFn: () =>
      apiClient.categories_retrieve({ params: { id: Number(value) } }),
    select: (data) =>
      ({ label: data.name, value: data.id.toString() }) satisfies Option,
  });
}

export function getCategoriesInfiniteQueryOptions({
  search,
  open = true,
}: {
  open?: boolean;
  search?: string;
}) {
  return infiniteQueryOptions({
    queryKey: [apiClient.categories_list.name, search],
    queryFn: ({ pageParam }) =>
      apiClient.categories_list({
        queries: { search },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length : undefined,
    select: (data) => data.pages.flatMap((page) => page.results),
    initialData: {
      pages: [
        {
          results: [],
          next: null,
          count: 0,
        },
      ],
      pageParams: [0],
    },
    enabled: open,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}
export function useInfiniteCategories(
  props: Parameters<typeof getCategoriesInfiniteQueryOptions>[0],
) {
  return useInfiniteQuery(getCategoriesInfiniteQueryOptions(props));
}

export function getCategoryQueryOptions(
  id: z.infer<typeof schemas.Category>["id"],
) {
  return queryOptions({
    queryKey: ["category", id],
    queryFn: () => apiClient.categories_retrieve({ params: { id } }),
  });
}
