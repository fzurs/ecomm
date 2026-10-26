import { OrderStatus } from "@workspace/api-client"
import { StatusBadge } from "@/components/status"
import { orderStatuses } from "../_lib/order-status"

export function OrderStatusBadge({
  status,
  ...props
}: Omit<React.ComponentProps<typeof StatusBadge>, "label" | "color"> & {
  status: OrderStatus
}) {
  return <StatusBadge {...orderStatuses[status]} {...props} />
}
