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
import { Order } from "@workspace/api-client"
import { Trash2Icon } from "lucide-react"
import { useOptimisticOrderDestroy } from "../_hooks/use-optimistic-order"

export function OrderDeleteAlertDialog() {
  const { row, rootProps, closeAction } = useRowActionDialog<Order>("delete")

  return (
    <AlertDialog {...rootProps}>
      <AlertDialogContent>
        {row && (
          <OrderDeleteAlertDialogContent item={row} onClose={closeAction} />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function OrderDeleteAlertDialogContent({
  item,
  onClose,
}: {
  item: Order
  onClose: () => void
}) {
  const mutation = useOptimisticOrderDestroy(item)
  const onDestroy = () => mutation.mutate({ path: { number: item.number } })

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive">
          <Trash2Icon />
        </AlertDialogMedia>
        <AlertDialogTitle>Delete order?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the order
          and remove all associated data.
          {item.invoice_status === "rejected" &&
            " Its rejected invoice is deleted too: ARCA never authorized it."}
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
