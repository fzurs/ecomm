import { useSuspenseQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";

export function useCategories() {
  return useSuspenseQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.categoriesList().then((res) => res.data),
  });
}
