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
    // Every customer detail: keys match partially, so `_id` alone covers any id.
    queryClient.invalidateQueries({ queryKey: [{ _id: "customersRetrieve" }] }),
  ])
}
