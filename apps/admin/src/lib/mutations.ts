import { mutationOptions } from "@tanstack/react-query";

import { productsApi } from "./apis";
import { getQueryClient } from "./get-query-client";

export const createProductMutationOptions = mutationOptions({
  mutationFn: (params: Parameters<typeof productsApi.productsCreate>[0]) =>
    productsApi.productsCreate(params).then((res) => res.data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: ["products"] });
  },
});
