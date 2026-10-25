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
    // Every product detail: keys match partially, so `_id` alone covers any slug.
    queryClient.invalidateQueries({ queryKey: [{ _id: "productsRetrieve" }] }),
  ])
}
