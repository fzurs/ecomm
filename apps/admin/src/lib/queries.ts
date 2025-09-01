import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { categoriesApi, productsApi } from "./api";

export const defaultPageSize = 100;

export const getProductsQueryOptions = (
  params: Parameters<typeof productsApi.productsList> = []
) =>
  queryOptions({
    queryKey: ["products", "list", params],
    queryFn: () => productsApi.productsList(...params).then((res) => res.data),
    placeholderData: (prev) => prev,
  });

export const getCategoriesInfiniteQueryOptions = (
  params: Parameters<typeof categoriesApi.categoriesList> = []
) =>
  infiniteQueryOptions({
    queryKey: ["categories", "list", params],
    queryFn: async ({ pageParam }) => {
      const limit = params[0] ?? defaultPageSize;
      return categoriesApi
        .categoriesList(limit, limit * pageParam, params[2])
        .then((res) => res.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length : undefined,
  });
