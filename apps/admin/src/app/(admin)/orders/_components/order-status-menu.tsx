"use client"
import { Order } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { CircleDashedIcon } from "lucide-react"
import { useOptimisticOrderStatusUpdate } from "../_hooks/use-optimistic-order"
import { OrderStatusRadioGroup } from "./order-status-radio-group"

export function OrderStatusMenu({
  order,
  size,
}: {
  order: Order
  size?: React.ComponentProps<typeof Button>["size"]
}) {
  const { status, setStatus } = useOptimisticOrderStatusUpdate(order)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size={size} />}>
        <CircleDashedIcon />
        Change status
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <OrderStatusRadioGroup value={status} onValueChange={setStatus} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
