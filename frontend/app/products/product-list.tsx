"use client";

import { productsApi } from "@/lib/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductsGrid } from "./products-grid";

export function ProductList() {
  const { data } = useSuspenseQuery({
    queryKey: [productsApi.productsList.name],
    queryFn: () => productsApi.productsList().then((res) => res.data),
  });

  return <ProductsGrid products={data} />;
}
