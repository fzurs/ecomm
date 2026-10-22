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
import { Customer } from "@workspace/api-client"
import { Trash2 } from "lucide-react"
import { useOptimisticCustomerDestroy } from "../_hooks/use-optimistic-destroy"

export function CustomerDeleteAlertDialog() {
  const { row, rootProps, closeAction } = useRowActionDialog<Customer>("delete")

  return (
    <AlertDialog {...rootProps}>
      <AlertDialogContent>
        {row && (
          <CustomerDeleteAlertDialogContent item={row} onClose={closeAction} />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function CustomerDeleteAlertDialogContent({
  item,
  onClose,
}: {
  item: Customer
  onClose: () => void
}) {
  const { onDestroy } = useOptimisticCustomerDestroy(item)

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive">
          <Trash2 />
        </AlertDialogMedia>
        <AlertDialogTitle>Delete customer?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the
          customer and remove all associated data.
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
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}
