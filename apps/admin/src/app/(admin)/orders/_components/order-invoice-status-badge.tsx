import { EmptyCell } from "@/components/empty-cell"
import { StatusBadge } from "@/components/status"
import { Order } from "@workspace/api-client"
import Link from "next/link"
import {
  orderInvoiceStatuses,
  toInvoiceStatus,
} from "../_lib/order-invoice-status"
import { isPaid } from "../_lib/order-status"

/** The status of the order's invoice. What's left to invoice stands out; an
 * unpaid order isn't due yet. */
export function OrderInvoiceStatusBadge({ order }: { order: Order }) {
  if (order.invoice_status === "not_invoiced") {
    return isPaid(order) ? (
      <StatusBadge {...toInvoiceStatus} />
    ) : (
      <EmptyCell label="Not invoiced" />
    )
  }
  // Links to the invoice, wherever the badge is.
  return (
    <StatusBadge
      {...orderInvoiceStatuses[order.invoice_status]}
      render={
        order.invoice_id ? (
          <Link href={`/invoices/${order.invoice_id}`} />
        ) : undefined
      }
    />
  )
}

/** Whether the badge has something to say outside a table cell, where the
 * dash of an unpaid order means nothing. */
export function showsInvoiceStatus(order: Order) {
  return order.invoice_status !== "not_invoiced" || isPaid(order)
}
