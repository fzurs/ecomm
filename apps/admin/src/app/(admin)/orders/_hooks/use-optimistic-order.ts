import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getServerErrorMessage } from "@/lib/utils"
import { Order, OrderStatus, PaginatedOrderList } from "@workspace/api-client"
import {
  ordersDestroyMutation,
  ordersListQueryKey,
  ordersPartialUpdateMutation,
  ordersRetrieveQueryKey,
} from "@workspace/api-client/query"

/**
 * Changes the order's status optimistically in both the order lists and the
 * order's detail, so the table, the view drawer and the page stay in sync
 * wherever the change is made.
 */
export function useOptimisticOrderStatusUpdate(order: Order) {
  const queryClient = useQueryClient()
  const listKey = ordersListQueryKey()
  const detailKey = ordersRetrieveQueryKey({ path: { number: order.number } })

  const { mutate, isPending } = useMutation({
    ...ordersPartialUpdateMutation(),
    onMutate: async ({ body }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: listKey }),
        queryClient.cancelQueries({ queryKey: detailKey }),
      ])
      // Every cached page and filter combination, each restored on error.
      const previousLists = queryClient.getQueriesData<PaginatedOrderList>({
        queryKey: listKey,
      })
      const previousDetail = queryClient.getQueryData<Order>(detailKey)

      queryClient.setQueriesData<PaginatedOrderList>(
        { queryKey: listKey },
        (old) =>
          old && {
            ...old,
            results: old.results.map((item) =>
              item.id === order.id ? { ...item, ...body } : item
            ),
          }
      )
      queryClient.setQueryData<Order>(
        detailKey,
        (old) => old && { ...old, ...body }
      )
      return { previousLists, previousDetail }
    },
    onError: (error, _, onMutateResult) => {
      onMutateResult?.previousLists.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      )
      queryClient.setQueryData(detailKey, onMutateResult?.previousDetail)
      toast.error(getServerErrorMessage(error))
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: listKey }),
        queryClient.invalidateQueries({ queryKey: detailKey }),
      ]),
  })

  const status: OrderStatus = order.status || "pending"

  const setStatus = (value: OrderStatus) => {
    if (value === status || isPending) return
    mutate({ path: { number: order.number }, body: { status: value } })
  }

  return { status, setStatus, isPending }
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
