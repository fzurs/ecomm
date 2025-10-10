import { UseQueryStateReturn, parseAsInteger, useQueryState } from "nuqs";

import { Category } from "@workspace/api-client";

export function useCategoryIdSearchParams(): UseQueryStateReturn<
  Category["id"],
  undefined
> {
  return useQueryState("category", parseAsInteger);
}
