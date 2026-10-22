import { QueryClient } from "@tanstack/react-query"
import {
  categoriesListChoicesQueryKey,
  categoriesListQueryKey,
} from "@workspace/api-client/query"

export async function invalidateCategories(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: categoriesListQueryKey() }),
    queryClient.invalidateQueries({
      queryKey: categoriesListChoicesQueryKey(),
    }),
  ])
}
