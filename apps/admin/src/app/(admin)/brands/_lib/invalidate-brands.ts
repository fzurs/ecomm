import { QueryClient } from "@tanstack/react-query"
import {
  brandsListChoicesQueryKey,
  brandsListQueryKey,
} from "@workspace/api-client/query"

export async function invalidateBrands(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: brandsListQueryKey() }),
    queryClient.invalidateQueries({ queryKey: brandsListChoicesQueryKey() }),
  ])
}
