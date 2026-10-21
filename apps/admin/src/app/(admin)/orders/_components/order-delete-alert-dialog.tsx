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
  const { row, rootProps } = useRowActionDialog<Order>("delete")

  return (
    <AlertDialog {...rootProps}>
      <AlertDialogContent>
        {row && <OrderDeleteAlertDialogContent item={row} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function OrderDeleteAlertDialogContent({ item }: { item: Order }) {
  const destroyMutation = useOptimisticOrderDestroy(item)
  const onDestroy = () =>
    destroyMutation.mutate({ path: { number: item.number } })

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
