import { QueryClient } from "@tanstack/react-query"
import {
  customersListChoicesQueryKey,
  customersListQueryKey,
} from "@workspace/api-client/query"

export async function invalidateCustomers(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: customersListQueryKey() }),
    queryClient.invalidateQueries({
      queryKey: customersListChoicesQueryKey(),
    }),
  ])
}
