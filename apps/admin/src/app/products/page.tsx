"use client";

import { Configuration, ProductsApi } from "@sdk";
import { useSuspenseQuery } from "@tanstack/react-query";

const apiUrl = "http://localhost:8000";

const config = new Configuration({ basePath: apiUrl });

const productsApi = new ProductsApi(config);

function useProducts() {
  return useSuspenseQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.productsList().then((res) => res.data),
  });
}

export default function ProductsPage() {
  const { data: products } = useProducts();

  return <div>{JSON.stringify(products)}</div>;
}
