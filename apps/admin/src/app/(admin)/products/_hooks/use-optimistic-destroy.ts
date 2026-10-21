import { useQueryClient, useMutation } from "@tanstack/react-query"
import { PaginatedProductList, Product } from "@workspace/api-client"
import {
  productsDestroyMutation,
  productsListQueryKey,
} from "@workspace/api-client/query"
import { invalidateProducts } from "../_lib/invalidate-products"

export function useOptimisticProductDestroy(item: Product) {
  const queryClient = useQueryClient()

  const queryKey = productsListQueryKey()

  const mutation = useMutation({
    ...productsDestroyMutation(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueriesData(
        { queryKey },
        (old: PaginatedProductList | undefined) => {
          if (!old) return old
          return {
            ...old,
            results: old.results.filter((product) => product.id !== item.id),
          }
        }
      )

      return { previousData }
    },
    onError: (err, _, onMutateResult) => {
      queryClient.setQueryData(queryKey, onMutateResult?.previousData)
    },
    onSettled: async () => {
      await invalidateProducts(queryClient)
    },
  })

  const onDestroy = () =>
    mutation.mutate({ path: { slug: item.slug as string } })

  return { mutation, onDestroy }
}
