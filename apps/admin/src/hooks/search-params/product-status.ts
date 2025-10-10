import { parseAsStringEnum, useQueryState } from "nuqs";

import { ProductStatusEnum } from "@workspace/api-client";

export const parseAsProductStatus = parseAsStringEnum(
  Object.values(ProductStatusEnum),
);

export function useProductStatusSearchParams() {
  return useQueryState("status", parseAsProductStatus);
}
