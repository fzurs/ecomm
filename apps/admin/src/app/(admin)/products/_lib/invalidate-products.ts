import { QueryClient } from "@tanstack/react-query"
import {
  productsListChoicesQueryKey,
  productsListQueryKey,
} from "@workspace/api-client/query"

export async function invalidateProducts(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: productsListQueryKey() }),
    queryClient.invalidateQueries({
      queryKey: productsListChoicesQueryKey(),
    }),
  ])
}
