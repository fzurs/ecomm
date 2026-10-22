import { useQueryClient, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { getServerErrorMessage } from "@/lib/utils"
import { PaginatedProductList, Product } from "@workspace/api-client"
import {
  productsDestroyMutation,
  productsListQueryKey,
} from "@workspace/api-client/query"
import { invalidateProducts } from "../_lib/invalidate-products"

export function useOptimisticProductDestroy(
  item: Product,
  { onSettled }: { onSettled?: () => void } = {}
) {
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
    onError: (error, _, onMutateResult) => {
      queryClient.setQueryData(queryKey, onMutateResult?.previousData)
      toast.error(getServerErrorMessage(error))
    },
    onSettled: async () => {
      await invalidateProducts(queryClient)
    },
  })

  const onDestroy = () =>
    mutation.mutate({ path: { slug: item.slug as string } }, { onSettled })

  return { mutation, onDestroy }
}
