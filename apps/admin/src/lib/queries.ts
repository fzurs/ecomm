import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { authApi, brandsApi, categoriesApi, productsApi } from "./api";

export const defaultPageSize = 100;

export const getProductsQueryOptions = (
  params: Parameters<typeof productsApi.productsList> = [],
) =>
  queryOptions({
    queryKey: ["products", "list", params],
    queryFn: () => productsApi.productsList(...params).then((res) => res.data),
    placeholderData: (prev) => prev,
  });

export const getCategoriesQueryOptions = (
  params: Parameters<typeof categoriesApi.categoriesList> = [],
) =>
  queryOptions({
    queryKey: ["categories", "list", params],
    queryFn: () =>
      categoriesApi.categoriesList(...params).then((res) => res.data),
  });

export const getCategoriesInfiniteQueryOptions = (
  params: Parameters<typeof categoriesApi.categoriesList>,
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
    placeholderData: (prev) => prev,
  });

export const userDetailsQueryOptions = queryOptions({
  queryKey: ["users", "me"],
  queryFn: () => authApi.authUserRetrieve().then((res) => res.data),
  retry: 0,
});

export const getBrandsQueryOptions = (
  params: Parameters<typeof brandsApi.brandsList> = [],
) =>
  queryOptions({
    queryKey: ["brands", "list", params],
    queryFn: () => brandsApi.brandsList(...params).then((res) => res.data),
  });
