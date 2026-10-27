import { Order, OrderStatus } from "@workspace/api-client"
import { zOrderStatus } from "@workspace/api-client/zod"
import { StatusDefinition, statusOptions } from "@/components/status"

// Keyed by the generated enum: a status added in the API fails the typecheck
// until it gets its label and color here.
export const orderStatuses: Record<OrderStatus, StatusDefinition> = {
  pending: { label: "Pending", color: "amber" },
  paid: { label: "Paid", color: "blue" },
  shipped: { label: "Shipped", color: "violet" },
  delivered: { label: "Delivered", color: "green" },
  cancelled: { label: "Cancelled", color: "red" },
}

// Charged: what can be invoiced (`Order.PAID_STATUSES` in the API).
const paidStatuses: OrderStatus[] = ["paid", "shipped", "delivered"]

export function isPaid(order: Order) {
  return !!order.status && paidStatuses.includes(order.status)
}

// In the API's order, for menus and filters.
export const orderStatusOptions = statusOptions(
  zOrderStatus.options,
  orderStatuses
)
