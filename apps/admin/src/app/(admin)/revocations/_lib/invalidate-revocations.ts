import { QueryClient } from "@tanstack/react-query"
import {
  ordersListQueryKey,
  revocationsListQueryKey,
} from "@workspace/api-client/query"

// Approving cancels the order and credits its invoice: the orders change too.
export async function invalidateRevocations(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: revocationsListQueryKey() }),
    queryClient.invalidateQueries({ queryKey: ordersListQueryKey() }),
  ])
}
