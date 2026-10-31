import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PaginatedShippingZoneList, ShippingZone } from "@workspace/api-client"
import {
  shippingZonesDestroyMutation,
  shippingZonesListQueryKey,
} from "@workspace/api-client/query"
import { toast } from "sonner"
import { getServerErrorMessage } from "@/lib/utils"
import { invalidateShippingZones } from "../_lib/invalidate-shipping-zones"

export function useOptimisticShippingZoneDestroy(item: ShippingZone) {
  const queryClient = useQueryClient()

  const queryKey = shippingZonesListQueryKey()

  const mutation = useMutation({
    ...shippingZonesDestroyMutation(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueriesData(
        { queryKey },
        (old: PaginatedShippingZoneList | undefined) => {
          if (!old) return old
          return {
            ...old,
            results: old.results.filter((zone) => zone.id !== item.id),
          }
        }
      )

      return { previousData }
    },
    onError: (error, _, onMutateResult) => {
      queryClient.setQueryData(queryKey, onMutateResult?.previousData)
      toast.error(getServerErrorMessage(error))
    },
    onSettled: async () => {
      await invalidateShippingZones(queryClient)
    },
  })

  const onDestroy = () => mutation.mutate({ path: { id: item.id } })

  return { mutation, onDestroy }
}
