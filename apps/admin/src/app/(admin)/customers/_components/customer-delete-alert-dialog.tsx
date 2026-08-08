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
import { useRowActions } from "./customers-provider"
import { Customer } from "@workspace/api-client"
import { Trash2 } from "lucide-react"
import { useOptimisticCustomerDestroy } from "../_hooks/use-optimistic-destroy"

export function CustomerDeleteAlertDialog() {
  const { open, setOpen, currentRow, setCurrentRow } = useRowActions<Customer>()

  return (
    <AlertDialog
      open={open === "delete"}
      onOpenChange={(open) => setOpen(open ? "delete" : null)}
    >
      <AlertDialogContent
        onAnimationEnd={() => {
          if (open === null) {
            setCurrentRow(null)
          }
        }}
      >
        {currentRow && <CustomerDeleteAlertDialogContent item={currentRow} />}
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
