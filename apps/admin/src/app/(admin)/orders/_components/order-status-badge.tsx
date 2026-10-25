import { OrderStatus } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "cn"
import React from "react"
import { orderStatuses } from "../_lib/order-status"

export function OrderStatusBadge({
  status,
  className,
  ...props
}: React.ComponentProps<typeof Badge> & { status: OrderStatus }) {
  const { label, badge } = orderStatuses[status]
  return (
    <Badge className={cn("rounded-md py-1", badge, className)} {...props}>
      {label}
    </Badge>
  )
}
