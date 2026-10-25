import { OrderStatus } from "@workspace/api-client"
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "cn"
import { orderStatuses, orderStatusOptions } from "../_lib/order-status"

/** Status options for a dropdown menu, each colored like its badge. */
export function OrderStatusRadioGroup({
  value,
  onValueChange,
}: {
  value: OrderStatus
  onValueChange: (status: OrderStatus) => void
}) {
  return (
    <DropdownMenuRadioGroup
      value={value}
      onValueChange={(status) => onValueChange(status as OrderStatus)}
    >
      {orderStatusOptions.map((opt) => (
        <DropdownMenuRadioItem
          key={opt.value}
          value={opt.value}
          className={cn(
            orderStatuses[opt.value].badge,
            orderStatuses[opt.value].focus,
            "bg-transparent dark:bg-transparent"
          )}
        >
          {opt.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}
