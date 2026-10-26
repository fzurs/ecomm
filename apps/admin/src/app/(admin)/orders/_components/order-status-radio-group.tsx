import { OrderStatus } from "@workspace/api-client"
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@workspace/ui/components/dropdown-menu"
import { orderStatusOptions } from "../_lib/order-status"

/** Status options for a dropdown menu, each with its status dot. */
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
        <DropdownMenuRadioItem key={opt.value} value={opt.value}>
          {opt.icon}
          {opt.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}
