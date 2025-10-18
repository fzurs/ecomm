import { infiniteQueryOptions, keepPreviousData } from "@tanstack/react-query";

import { CategoriesApiCategoriesListRequest } from "@workspace/api-client";

import { categoriesApi } from "./apis";

export const getCategoriesInfiniteQueryOptions = (
  params?: CategoriesApiCategoriesListRequest,
) =>
  infiniteQueryOptions({
    queryKey: ["categories", "list", "infinite", params],
    queryFn: ({ pageParam }) =>
      categoriesApi
        .categoriesList({
          limit: params?.limit,
          offset: (params?.limit ?? 0) * pageParam,
          ...params,
        })
        .then((res) => res.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length : undefined,
    placeholderData: keepPreviousData,
  });
