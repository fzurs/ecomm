import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { defaultPageSize } from "@/config/constants";

import {
  authApi,
  brandsApi,
  categoriesApi,
  customersApi,
  productsApi,
} from "./api";

export const getProductsQueryOptions = (
  ...params: Parameters<typeof productsApi.productsList>
) =>
  queryOptions({
    queryKey: ["products", "list", params[0]],
    queryFn: () => productsApi.productsList(...params).then((res) => res.data),
    placeholderData: (prev) => prev,
  });

export const getCategoriesInfiniteQueryOptions = (
  ...params: Parameters<typeof categoriesApi.categoriesList>
) =>
  infiniteQueryOptions({
    queryKey: ["categories", "list", params[0]],
    queryFn: async ({ pageParam }) => {
      const limit = params[0]?.limit ?? defaultPageSize;
      params[0] = {
        limit,
        offset: limit * pageParam,
        ...params[0],
      };
      return categoriesApi.categoriesList(...params).then((res) => res.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length : undefined,
    placeholderData: (prev) => prev,
  });

export const getBrandsInfiniteQueryOptions = (
  ...params: Parameters<typeof categoriesApi.categoriesList>
) =>
  infiniteQueryOptions({
    queryKey: ["brands", "list", params[0]],
    queryFn: async ({ pageParam }) => {
      const limit = params[0]?.limit ?? defaultPageSize;
      params[0] = {
        limit,
        offset: limit * pageParam,
        ...params[0],
      };
      return brandsApi.brandsList(...params).then((res) => res.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length : undefined,
    placeholderData: (prev) => prev,
  });

export async function currentUser() {
  return authApi
    .authUserRetrieve()
    .then((res) => res.data)
    .catch((err) =>
      isAxiosError(err) && err.response?.status === 403
        ? null
        : Promise.reject(err),
    );
}

export const currentUserQueryOptions = queryOptions({
  queryKey: ["current-user"],
  queryFn: currentUser,
  retry: 0,
});

export const getCustomersQueryOptions = (
  ...params: Parameters<typeof customersApi.customersList>
) =>
  queryOptions({
    queryKey: ["customers", "list", params[0]],
    queryFn: () =>
      customersApi.customersList(...params).then((res) => res.data),
    placeholderData: (prev) => prev,
  });

export const getCategoryQueryOptions = (
  ...params: Parameters<typeof categoriesApi.categoriesRetrieve>
) =>
  queryOptions({
    queryKey: ["categories", params[0]],
    queryFn: () =>
      categoriesApi.categoriesRetrieve(...params).then((res) => res.data),
  });
