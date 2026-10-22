import { OrderStatus } from "@workspace/api-client"
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"
import { orderStatusClasses, orderStatusOptions } from "../_lib/order-status"

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
            orderStatusClasses[opt.value].badge,
            orderStatusClasses[opt.value].focus,
            "bg-transparent dark:bg-transparent"
          )}
        >
          {opt.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}
