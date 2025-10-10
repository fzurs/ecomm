import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from "@tanstack/react-query";

import { categoriesApi } from "@/lib/apis";

export const getCategoriesInfiniteQueryOptions = (
  params?: Parameters<typeof categoriesApi.categoriesList>[0],
) =>
  infiniteQueryOptions({
    queryKey: ["categories", "infinite", params],
    queryFn: ({ pageParam }) =>
      categoriesApi
        .categoriesList({
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

export const getCategoryQueryOptions = (
  params: Parameters<typeof categoriesApi.categoriesRetrieve>[0],
) =>
  queryOptions({
    queryKey: ["categories", params],
    queryFn: () =>
      categoriesApi.categoriesRetrieve(params).then((res) => res.data),
  });
