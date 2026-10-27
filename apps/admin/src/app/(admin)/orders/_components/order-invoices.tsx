"use client"
import { useQuery } from "@tanstack/react-query"
import { Order } from "@workspace/api-client"
import { invoicesListOptions } from "@workspace/api-client/query"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { FileTextIcon } from "lucide-react"
import { useState } from "react"
import { RelatedVouchers } from "../../invoices/_components/related-vouchers"
import { canInvoice, invoiceActionLabel } from "../_lib/order-invoice-status"
import { isPaid } from "../_lib/order-status"
import { OrderInvoiceDialog } from "./order-invoice-dialog"

/** Opens the invoice dialog of the order, when it can be invoiced. */
export function OrderInvoiceButton({
  order,
  ...props
}: { order: Order } & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false)
  if (!canInvoice(order)) return null

  return (
    <>
      <Button {...props} onClick={() => setOpen(true)}>
        <FileTextIcon />
        {invoiceActionLabel(order)}
      </Button>
      <OrderInvoiceDialog order={order} open={open} onOpenChange={setOpen} />
    </>
  )
}

/** The vouchers of the order (its invoice and notes), or what invoicing it needs. */
export function OrderInvoices({ order }: { order: Order }) {
  const { data } = useQuery(
    invoicesListOptions({ query: { order: order.id, ordering: "created_at" } })
  )
  const vouchers = data?.results ?? []

  if (vouchers.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileTextIcon />
          </EmptyMedia>
          <EmptyTitle>Not invoiced yet</EmptyTitle>
          <EmptyDescription>
            {isPaid(order)
              ? "The invoice is emitted to ARCA. You'll see what it will contain before emitting it."
              : "Only paid orders are invoiced. Change its status to paid to invoice it."}
          </EmptyDescription>
        </EmptyHeader>
        {isPaid(order) && (
          <EmptyContent>
            <OrderInvoiceButton order={order} variant="outline" />
          </EmptyContent>
        )}
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {order.invoice_status === "rejected" && (
        <p className="text-sm text-muted-foreground">
          ARCA rejected the invoice. Fix what its messages point out (usually
          the customer&apos;s fiscal data) and emit it again.
        </p>
      )}
      <RelatedVouchers vouchers={vouchers} />
    </div>
  )
}
