import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { useRowActionDialog } from "@/context/row-actions-provider"
import { Category } from "@workspace/api-client"
import { Trash2Icon } from "lucide-react"
import { useOptimisticCategoryDestroy } from "../_hooks/use-optimistic-destroy"

export function CategoryDeleteAlertDialog() {
  const { row, rootProps, closeAction } = useRowActionDialog<Category>("delete")

  return (
    <AlertDialog {...rootProps}>
      <AlertDialogContent size="sm">
        {row && (
          <CategoryDeleteAlertDialogContent
            item={row}
            onSettled={closeAction}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function CategoryDeleteAlertDialogContent({
  item,
  onSettled,
}: {
  item: Category
  onSettled: () => void
}) {
  const { mutation, onDestroy } = useOptimisticCategoryDestroy(item, {
    onSettled,
  })

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
          <Trash2Icon />
        </AlertDialogMedia>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          Once deleted, there is no going back; the item will be permanently
          deleted.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          onClick={onDestroy}
          disabled={mutation.isPending}
        >
          Delete Category
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}
