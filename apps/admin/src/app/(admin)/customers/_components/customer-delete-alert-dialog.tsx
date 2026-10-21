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
  const { row, rootProps } = useRowActionDialog<Customer>("delete")

  return (
    <AlertDialog {...rootProps}>
      <AlertDialogContent>
        {row && <CustomerDeleteAlertDialogContent item={row} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function CustomerDeleteAlertDialogContent({ item }: { item: Customer }) {
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
        <AlertDialogAction variant="destructive" onClick={onDestroy}>
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}
