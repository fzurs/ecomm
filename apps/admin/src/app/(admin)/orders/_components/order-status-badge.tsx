import { OrderStatus } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "cn"
import React from "react"
import { orderStatusClasses, orderStatusOptions } from "../_lib/order-status"

export function OrderStatusBadge({
  status,
  className,
  ...props
}: React.ComponentProps<typeof Badge> & { status: OrderStatus }) {
  const statusOption = orderStatusOptions.find(
    (option) => option.value === status
  )
  if (!statusOption) return null
  return (
    <Badge
      className={cn(
        "rounded-md py-1",
        orderStatusClasses[status].badge,
        className
      )}
      {...props}
    >
      {statusOption.label}
    </Badge>
  )
}
