import { QueryClient } from "@tanstack/react-query"
import { invoicesListQueryKey } from "@workspace/api-client/query"

export async function invalidateInvoices(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: invoicesListQueryKey() }),
    // Every voucher detail: keys match partially, so `_id` alone covers any
    // id. A note changes its invoice too (notes, credit left).
    queryClient.invalidateQueries({ queryKey: [{ _id: "invoicesRetrieve" }] }),
  ])
}
