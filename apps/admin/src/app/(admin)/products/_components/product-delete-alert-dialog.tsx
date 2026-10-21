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
  const { row, rootProps } = useRowActionDialog<Product>("delete")

  return (
    <AlertDialog {...rootProps}>
      <AlertDialogContent>
        {row && <ProductDeleteAlertDialogContent item={row} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ProductDeleteAlertDialogContent({ item }: { item: Product }) {
  const { onDestroy } = useOptimisticProductDestroy(item)

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
        <AlertDialogAction variant="destructive" onClick={onDestroy}>
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}
