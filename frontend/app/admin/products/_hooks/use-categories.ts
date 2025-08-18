import { useQuery } from "@tanstack/react-query";
import { Category } from "../_lib/product-schema";

async function getCategories() {
  const response = await fetch("https://dummyjson.com/products/categories");
  return response.json();
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}
