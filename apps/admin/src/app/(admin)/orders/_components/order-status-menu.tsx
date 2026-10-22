"use client"
import { Order, OrderStatus } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { CircleDashedIcon } from "lucide-react"
import { useOptimisticOrderDetailUpdate } from "../_hooks/use-optimistic-order"
import { OrderStatusRadioGroup } from "./order-status-radio-group"

export function OrderStatusMenu({ order }: { order: Order }) {
  const { mutate, isPending } = useOptimisticOrderDetailUpdate(order)

  const status: OrderStatus = order.status || "pending"

  const onStatusChange = (value: OrderStatus) => {
    if (value === status || isPending) return
    mutate({ path: { number: order.number }, body: { status: value } })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <CircleDashedIcon />
        Change status
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <OrderStatusRadioGroup value={status} onValueChange={onStatusChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
