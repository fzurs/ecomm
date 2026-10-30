import type { OrderStatus } from "@workspace/api-client"

/** An order's status as its customer reads it. */
export const orderStatuses: Record<
  OrderStatus,
  {
    label: string
    variant: "default" | "secondary" | "outline" | "destructive"
  }
> = {
  pending: { label: "Awaiting payment", variant: "outline" },
  paid: { label: "Paid", variant: "secondary" },
  shipped: { label: "Shipped", variant: "secondary" },
  delivered: { label: "Delivered", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}
