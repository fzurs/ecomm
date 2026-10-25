import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getServerErrorMessage } from "@/lib/utils"
import { Order, PaginatedOrderList } from "@workspace/api-client"
import {
  ordersDestroyMutation,
  ordersListQueryKey,
  ordersPartialUpdateMutation,
  ordersRetrieveQueryKey,
} from "@workspace/api-client/query"

export function useOptimisticOrderUpdate(order: Order) {
  const queryClient = useQueryClient()
  const queryKey = ordersListQueryKey()

  return useMutation({
    ...ordersPartialUpdateMutation(),
    onMutate: ({ body }) => {
      queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)
      queryClient.setQueriesData({ queryKey }, (old: PaginatedOrderList) => {
        if (!old) return old
        return {
          ...old,
          results: old.results.map((item) =>
            item.id === order.id ? { ...item, ...body } : item
          ),
        }
      })
      return { previousData }
    },
    onError: (err, _, onMutateResult) =>
      queryClient.setQueryData(queryKey, onMutateResult?.previousData),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        // The view drawer and the detail page read this one.
        queryClient.invalidateQueries({
          queryKey: ordersRetrieveQueryKey({ path: { number: order.number } }),
        }),
      ]),
  })
}

/** Same as useOptimisticOrderUpdate, for the order detail query. */
export function useOptimisticOrderDetailUpdate(order: Order) {
  const queryClient = useQueryClient()
  const queryKey = ordersRetrieveQueryKey({ path: { number: order.number } })

  return useMutation({
    ...ordersPartialUpdateMutation(),
    onMutate: async ({ body }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<Order>(queryKey)
      queryClient.setQueryData<Order>(
        queryKey,
        (old) => old && { ...old, ...body }
      )
      return { previousData }
    },
    onError: (err, _, onMutateResult) =>
      queryClient.setQueryData(queryKey, onMutateResult?.previousData),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: ordersListQueryKey() }),
      ]),
  })
}

export function useOptimisticOrderDestroy(order: Order) {
  const queryClient = useQueryClient()
  const queryKey = ordersListQueryKey()

  return useMutation({
    ...ordersDestroyMutation(),
    onMutate: () => {
      queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueriesData({ queryKey }, (old: PaginatedOrderList) => {
        if (!old) return old
        return {
          ...old,
          results: old.results.filter((item) => item.id !== order.id),
        }
      })

      return { previousData }
    },
    onError: (error, _, onMutateResult) => {
      queryClient.setQueryData(queryKey, onMutateResult?.previousData)
      toast.error(getServerErrorMessage(error))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}
