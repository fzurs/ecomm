import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Invoice } from "@workspace/api-client"
import { invoicesDestroyMutation } from "@workspace/api-client/query"
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
import { toast } from "sonner"
import { useRowActionDialog } from "@/context/row-actions-provider"
import { getServerErrorMessage } from "@/lib/utils"
import { invalidateInvoices } from "../_lib/invalidate-invoices"
import { voucherName } from "../_lib/voucher-type"

export function InvoiceDeleteAlertDialog() {
  const { row, rootProps, closeAction } = useRowActionDialog<Invoice>("delete")

  return (
    <AlertDialog {...rootProps}>
      <AlertDialogContent>
        {row && (
          <InvoiceDeleteAlertDialogContent item={row} onClose={closeAction} />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function InvoiceDeleteAlertDialogContent({
  item,
  onClose,
}: {
  item: Invoice
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    ...invoicesDestroyMutation(),
    onError: (error) => toast.error(getServerErrorMessage(error)),
    onSettled: () => invalidateInvoices(queryClient),
  })

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive">
          <Trash2Icon />
        </AlertDialogMedia>
        <AlertDialogTitle>Delete {voucherName(item)}?</AlertDialogTitle>
        <AlertDialogDescription>
          ARCA rejected it, so it has no number. Deleting it can&apos;t be
          undone; the order can be invoiced again.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          onClick={() => {
            mutation.mutate({ path: { id: item.id } })
            onClose()
          }}
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}
