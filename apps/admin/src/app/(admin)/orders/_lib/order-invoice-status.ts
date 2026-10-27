import { Order, OrderInvoiceStatus } from "@workspace/api-client"
import { zOrderInvoiceStatus } from "@workspace/api-client/zod"
import { StatusDefinition, statusOptions } from "@/components/status"
import { isPaid } from "./order-status"

// Keyed by the generated enum: the status of the order's invoice, or none yet.
// The colors match `invoiceStatuses`.
export const orderInvoiceStatuses: Record<
  OrderInvoiceStatus,
  StatusDefinition
> = {
  not_invoiced: { label: "Not invoiced", color: "gray" },
  pending: { label: "Pending", color: "amber" },
  authorized: { label: "Authorized", color: "green" },
  rejected: { label: "Rejected", color: "red" },
  unverified: { label: "Unverified", color: "orange" },
}

// A paid order that isn't invoiced: not a status of its own, but what the
// badge shows and the API filters by (`invoice_status=to_invoice`). Blue, a
// color no invoice status uses.
export const toInvoiceStatus: StatusDefinition = {
  label: "To invoice",
  color: "blue",
}

// For the filter: what's left to invoice first, then the API's order.
export const orderInvoiceStatusOptions = [
  ...statusOptions(["to_invoice"], { to_invoice: toInvoiceStatus }),
  ...statusOptions(zOrderInvoiceStatus.options, orderInvoiceStatuses),
]

/** A paid order without an invoice, or whose invoice ARCA rejected. */
export function canInvoice(order: Order) {
  return (
    isPaid(order) &&
    (order.invoice_status === "not_invoiced" ||
      order.invoice_status === "rejected")
  )
}

/** The label of the action that invoices the order. */
export function invoiceActionLabel(order: Order) {
  return order.invoice_status === "rejected"
    ? "Emit invoice again"
    : "Create invoice"
}
