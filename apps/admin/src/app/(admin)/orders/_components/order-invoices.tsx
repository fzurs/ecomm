"use client"
import { useQuery } from "@tanstack/react-query"
import { Order } from "@workspace/api-client"
import { invoicesListOptions } from "@workspace/api-client/query"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { FileTextIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { RelatedVouchers } from "../../invoices/_components/related-vouchers"
import {
  canInvoice,
  invoiceActionLabel,
  isInvoiced,
} from "../_lib/order-invoice-status"
import { isPaid } from "../_lib/order-status"
import { OrderInvoiceDialog } from "./order-invoice-dialog"

/**
 * Always there, as the row action: it opens the invoice once there is one,
 * invoices the order when it can, and else says why it can't.
 */
export function OrderInvoiceButton({
  order,
  ...props
}: { order: Order } & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false)

  if (isInvoiced(order) && order.invoice_id) {
    return (
      <Link
        href={`/invoices/${order.invoice_id}`}
        className={buttonVariants({ variant: "outline", size: props.size })}
      >
        <FileTextIcon />
        View invoice
      </Link>
    )
  }
  if (!canInvoice(order)) {
    // A cancelled order won't be invoiced: nothing to point to.
    if (order.status === "cancelled") return null
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size={props.size}
              disabled
              focusableWhenDisabled
            />
          }
        >
          <FileTextIcon />
          Create invoice
        </TooltipTrigger>
        <TooltipContent>Only paid orders are invoiced.</TooltipContent>
      </Tooltip>
    )
  }

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
              : order.status === "cancelled"
                ? "The order is cancelled: it isn't invoiced."
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
