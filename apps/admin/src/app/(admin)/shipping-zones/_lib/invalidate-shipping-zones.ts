import { QueryClient } from "@tanstack/react-query"
import { shippingZonesListQueryKey } from "@workspace/api-client/query"

export async function invalidateShippingZones(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    queryKey: shippingZonesListQueryKey(),
  })
}
