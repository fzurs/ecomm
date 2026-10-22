import { useQueryClient, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { getServerErrorMessage } from "@/lib/utils"
import { Category, PaginatedCategoryList } from "@workspace/api-client"
import {
  categoriesDestroyMutation,
  categoriesListQueryKey,
} from "@workspace/api-client/query"
import { invalidateCategories } from "../_lib/invalidate-categories"

export function useOptimisticCategoryDestroy(
  item: Category,
  { onSettled }: { onSettled?: () => void } = {}
) {
  const queryClient = useQueryClient()

  const queryKey = categoriesListQueryKey()

  const mutation = useMutation({
    ...categoriesDestroyMutation(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueriesData(
        { queryKey },
        (old: PaginatedCategoryList | undefined) => {
          if (!old) return old
          return {
            ...old,
            results: old.results.filter((category) => category.id !== item.id),
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
      await invalidateCategories(queryClient)
    },
  })

  const onDestroy = () =>
    mutation.mutate({ path: { slug: item.slug as string } }, { onSettled })

  return { mutation, onDestroy }
}
