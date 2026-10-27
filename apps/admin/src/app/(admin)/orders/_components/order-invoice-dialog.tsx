"use client"
import { useQuery } from "@tanstack/react-query"
import { InvoicePreview, invoicesPreview, Order } from "@workspace/api-client"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
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
import { Skeleton } from "@workspace/ui/components/skeleton"
import { CircleAlertIcon, FileTextIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRowActionDialog } from "@/context/row-actions-provider"
import {
  formatDocument,
  receptorDocumentTypes,
  vatConditions,
} from "@/lib/fiscal"
import { formatPrice, getServerErrorMessage } from "@/lib/utils"
import { useCreateInvoice } from "../../invoices/_hooks/use-invoice-mutations"
import { voucherTypes } from "../../invoices/_lib/voucher-type"

/** The invoice dialog of the order row actions. */
export function OrderInvoiceRowDialog() {
  const { row, rootProps, closeAction } = useRowActionDialog<Order>("invoice")

  return (
    <AlertDialog {...rootProps}>
      <AlertDialogContent>
        {row && <OrderInvoiceDialogContent order={row} onClose={closeAction} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function OrderInvoiceDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <OrderInvoiceDialogContent
          order={order}
          onClose={() => onOpenChange(false)}
        />
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Emitting can't be undone (ARCA numbers the voucher), so the dialog first
// shows what would be emitted: the preview builds it without calling ARCA.
function OrderInvoiceDialogContent({
  order,
  onClose,
}: {
  order: Order
  onClose: () => void
}) {
  const router = useRouter()
  const preview = useQuery({
    queryKey: ["invoicesPreview", order.id],
    queryFn: async () =>
      (await invoicesPreview({ body: { order: order.id }, throwOnError: true }))
        .data,
    // The customer or the order may have just been fixed.
    staleTime: 0,
    gcTime: 0,
    retry: false,
  })
  const create = useCreateInvoice()

  const onEmit = () => {
    create.mutate(
      { body: { order: order.id } },
      { onSuccess: (invoice) => router.push(`/invoices/${invoice.id}`) }
    )
    onClose()
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia>
          <FileTextIcon />
        </AlertDialogMedia>
        <AlertDialogTitle>Invoice {order.number}?</AlertDialogTitle>
        <AlertDialogDescription>
          The voucher is emitted to ARCA right away. Once authorized it
          can&apos;t be deleted: it can only be adjusted with notes.
        </AlertDialogDescription>
      </AlertDialogHeader>
      {preview.isPending && <Skeleton className="h-32 w-full" />}
      {preview.isError && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>It can&apos;t be invoiced</AlertTitle>
          <AlertDescription>
            {getServerErrorMessage(preview.error)}
          </AlertDescription>
        </Alert>
      )}
      {preview.data && <InvoicePreviewDetails preview={preview.data} />}
      <AlertDialogFooter>
        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
        <AlertDialogAction disabled={!preview.data} onClick={onEmit}>
          Emit{" "}
          {preview.data ? voucherTypes[preview.data.voucher_type] : "invoice"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}

function InvoicePreviewDetails({ preview }: { preview: InvoicePreview }) {
  const rows = [
    { label: "Voucher", value: voucherTypes[preview.voucher_type] },
    { label: "Receptor", value: preview.receptor_name },
    {
      label: "Document",
      value: formatDocument(
        receptorDocumentTypes[preview.receptor_document_type],
        preview.receptor_document_number
      ),
    },
    {
      label: "IVA condition",
      value: vatConditions[preview.receptor_vat_condition],
    },
    ...(preview.letter === "C"
      ? []
      : [
          { label: "Net", value: formatPrice(preview.net_amount) },
          { label: "IVA", value: formatPrice(preview.vat_amount) },
        ]),
    { label: "Total", value: formatPrice(preview.total_amount) },
  ]

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="py-1 text-muted-foreground">{row.label}</dt>
          <dd className="py-1 text-right font-medium">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
