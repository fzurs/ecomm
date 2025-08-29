import { queryOptions } from "@tanstack/react-query";
import { categoriesApi, productsApi } from "./api";

export const productsQueryOptions = queryOptions({
  queryKey: ["products", "list"],
  queryFn: () => productsApi.productsList().then((res) => res.data),
});

export const categoriesQueryOptions = queryOptions({
  queryKey: ["categories", "list"],
  queryFn: () => categoriesApi.categoriesList().then((res) => res.data),
});
