import z from "zod";
import { Product, productSchema } from "../_lib/product-schema";
import { useSuspenseQuery } from "@tanstack/react-query";

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("https://dummyjson.com/products");

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const rawData = await response.json();

  return z.array(productSchema).parse(rawData.products);
}

export function useProducts() {
  return useSuspenseQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
