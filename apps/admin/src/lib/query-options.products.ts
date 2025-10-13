import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { productsApi } from "./apis";

export const getProductsQueryOptions = (
  params?: Parameters<typeof productsApi.productsList>[0],
) =>
  queryOptions({
    queryKey: ["products", "list", params],
    queryFn: () => productsApi.productsList(params).then((res) => res.data),
    placeholderData: keepPreviousData,
  });
