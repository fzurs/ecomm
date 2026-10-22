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
  const { row, rootProps } = useRowActionDialog<Brand>("delete")

  return (
    <AlertDialog {...rootProps}>
      <AlertDialogContent size="sm">
        {row && <BrandDeleteAlertDialogContent item={row} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function BrandDeleteAlertDialogContent({ item }: { item: Brand }) {
  const { onDestroy } = useOptimisticBrandDestroy(item)

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
          <Trash2Icon />
        </AlertDialogMedia>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          Once deleted, there is no going back; the item will be permanently
          deleted.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onDestroy}>
          Delete Brand
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}
