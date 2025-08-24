import { useSuspenseQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";

export function useProducts() {
  return useSuspenseQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.productsList().then((res) => res.data),
  });
}
