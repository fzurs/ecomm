import { useQueryClient, useMutation } from "@tanstack/react-query"
import { Customer, PaginatedCustomerList } from "@workspace/api-client"
import {
  customersListQueryKey,
  customersDestroyMutation,
} from "@workspace/api-client/query"
import { invalidateCustomers } from "../_lib/invalidate-customers"

export function useOptimisticCustomerDestroy(item: Customer) {
  const queryClient = useQueryClient()

  const queryKey = customersListQueryKey()

  const mutation = useMutation({
    ...customersDestroyMutation(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueriesData(
        { queryKey },
        (old: PaginatedCustomerList | undefined) => {
          if (!old) return old
          return {
            ...old,
            results: old.results.filter((customer) => customer.id !== item.id),
          }
        }
      )

      return { previousData }
    },
    onError: (err, _, onMutateResult) => {
      queryClient.setQueryData(queryKey, onMutateResult?.previousData)
    },
    onSettled: async () => {
      await invalidateCustomers(queryClient)
    },
  })

  const onDestroy = () => mutation.mutate({ path: { id: item.id } })

  return { mutation, onDestroy }
}
