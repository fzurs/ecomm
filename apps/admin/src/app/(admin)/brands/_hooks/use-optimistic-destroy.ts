import { useQueryClient, useMutation } from "@tanstack/react-query"
import { Brand, PaginatedBrandList } from "@workspace/api-client"
import {
  brandsDestroyMutation,
  brandsListQueryKey,
} from "@workspace/api-client/query"
import { invalidateBrands } from "../_lib/invalidate-brands"

export function useOptimisticBrandDestroy(item: Brand) {
  const queryClient = useQueryClient()

  const queryKey = brandsListQueryKey()

  const mutation = useMutation({
    ...brandsDestroyMutation(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueriesData(
        { queryKey },
        (old: PaginatedBrandList | undefined) => {
          if (!old) return old
          return {
            ...old,
            results: old.results.filter((brand) => brand.id !== item.id),
          }
        }
      )

      return { previousData }
    },
    onError: (err, _, onMutateResult) => {
      queryClient.setQueryData(queryKey, onMutateResult?.previousData)
    },
    onSettled: async () => {
      await invalidateBrands(queryClient)
    },
  })

  const onDestroy = () =>
    mutation.mutate({ path: { slug: item.slug as string } })

  return { mutation, onDestroy }
}
