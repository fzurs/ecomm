import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from "@tanstack/react-query";

import { productsApi } from "@/lib/apis";

export const getProductsInfiniteQueryOptions = (
  params: Parameters<typeof productsApi.productsList>[0],
) =>
  infiniteQueryOptions({
    queryKey: ["products", "infinite", params],
    queryFn: ({ pageParam }) =>
      productsApi
        .productsList({
          limit: 10,
          offset: pageParam * 10,
          ...params,
        })
        .then((res) => res.data),
    placeholderData: keepPreviousData,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length : undefined,
  });

export const getProductQueryOptions = (
  params: Parameters<typeof productsApi.productsRetrieve>[0],
) =>
  queryOptions({
    queryKey: ["products", "retrive", params],
    queryFn: () => productsApi.productsRetrieve(params).then((res) => res.data),
  });

export const getProductsQueryOptions = (
  params: Parameters<typeof productsApi.productsList>[0],
) =>
  queryOptions({
    queryKey: ["products", params],
    queryFn: () => productsApi.productsList(params).then((res) => res.data),
  });
