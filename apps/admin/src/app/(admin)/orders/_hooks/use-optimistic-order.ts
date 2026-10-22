import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Order, PaginatedOrderList } from "@workspace/api-client"
import {
  ordersDestroyMutation,
  ordersListQueryKey,
  ordersPartialUpdateMutation,
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
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
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
    onError: (err, _, onMutateResult) =>
      queryClient.setQueryData(queryKey, onMutateResult?.previousData),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}
