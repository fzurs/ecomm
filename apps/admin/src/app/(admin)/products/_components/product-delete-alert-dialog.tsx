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
import { Product } from "@workspace/api-client"
import { Trash2Icon } from "lucide-react"
import { useOptimisticProductDestroy } from "../_hooks/use-optimistic-destroy"

export function ProductDeleteAlertDialog() {
  const { row, rootProps, closeAction } = useRowActionDialog<Product>("delete")

  return (
    <AlertDialog {...rootProps}>
      <AlertDialogContent>
        {row && (
          <ProductDeleteAlertDialogContent item={row} onSettled={closeAction} />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ProductDeleteAlertDialogContent({
  item,
  onSettled,
}: {
  item: Product
  onSettled: () => void
}) {
  const { mutation, onDestroy } = useOptimisticProductDestroy(item, {
    onSettled,
  })

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive">
          <Trash2Icon />
        </AlertDialogMedia>
        <AlertDialogTitle>Delete product?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the product
          and remove all associated data.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          onClick={onDestroy}
          disabled={mutation.isPending}
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}
