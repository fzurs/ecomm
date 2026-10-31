import { ShippingZone } from "@workspace/api-client"
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
import { Trash2Icon } from "lucide-react"
import { useRowActionDialog } from "@/context/row-actions-provider"
import { useOptimisticShippingZoneDestroy } from "../_hooks/use-optimistic-destroy"

export function ShippingZoneDeleteAlertDialog() {
  const { row, rootProps, closeAction } =
    useRowActionDialog<ShippingZone>("delete")

  return (
    <AlertDialog {...rootProps}>
      <AlertDialogContent size="sm">
        {row && (
          <ShippingZoneDeleteAlertDialogContent
            item={row}
            onClose={closeAction}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ShippingZoneDeleteAlertDialogContent({
  item,
  onClose,
}: {
  item: ShippingZone
  onClose: () => void
}) {
  const { onDestroy } = useOptimisticShippingZoneDestroy(item)

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
          <Trash2Icon />
        </AlertDialogMedia>
        <AlertDialogTitle>Delete shipping zone?</AlertDialogTitle>
        <AlertDialogDescription>
          The store stops shipping to its provinces. Placed orders keep their
          shipping.
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
          Delete zone
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}
