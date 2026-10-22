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
          <CategoryDeleteAlertDialogContent item={row} onClose={closeAction} />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function CategoryDeleteAlertDialogContent({
  item,
  onClose,
}: {
  item: Category
  onClose: () => void
}) {
  const { onDestroy } = useOptimisticCategoryDestroy(item)

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
          <Trash2Icon />
        </AlertDialogMedia>
        <AlertDialogTitle>Delete category?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. Its products are kept, without a
          category.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          onClick={() => {
            // The row is already gone optimistically; errors show up as a toast.
            onDestroy()
            onClose()
          }}
        >
          Delete Category
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}
