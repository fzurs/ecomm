import { EmptyCell } from "@/components/empty-cell"
import { StatusBadge } from "@/components/status"
import { Order } from "@workspace/api-client"
import {
  orderInvoiceStatuses,
  toInvoiceStatus,
} from "../_lib/order-invoice-status"

/** The status of the order's invoice. What's left to invoice stands out; an
 * unpaid order isn't due yet. */
export function OrderInvoiceStatusBadge({ order }: { order: Order }) {
  if (order.invoice_status === "not_invoiced") {
    return order.status === "paid" ? (
      <StatusBadge {...toInvoiceStatus} />
    ) : (
      <EmptyCell label="Not invoiced" />
    )
  }
  return <StatusBadge {...orderInvoiceStatuses[order.invoice_status]} />
}

/** Whether the badge has something to say outside a table cell, where the
 * dash of an unpaid order means nothing. */
export function showsInvoiceStatus(order: Order) {
  return order.invoice_status !== "not_invoiced" || order.status === "paid"
}
