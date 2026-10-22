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
import { Brand } from "@workspace/api-client"
import { Trash2Icon } from "lucide-react"
import { useOptimisticBrandDestroy } from "../_hooks/use-optimistic-destroy"

export function BrandDeleteAlertDialog() {
  const { row, rootProps, closeAction } = useRowActionDialog<Brand>("delete")

  return (
    <AlertDialog {...rootProps}>
      <AlertDialogContent size="sm">
        {row && (
          <BrandDeleteAlertDialogContent item={row} onClose={closeAction} />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function BrandDeleteAlertDialogContent({
  item,
  onClose,
}: {
  item: Brand
  onClose: () => void
}) {
  const { onDestroy } = useOptimisticBrandDestroy(item)

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
          <Trash2Icon />
        </AlertDialogMedia>
        <AlertDialogTitle>Delete brand?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. Its products are kept, without a brand.
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
          Delete Brand
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}
