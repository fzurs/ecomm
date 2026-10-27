import { OrderStatus, OrderStatusLock } from "@workspace/api-client"
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@workspace/ui/components/dropdown-menu"
import { orderStatusOptions } from "../_lib/order-status"

/**
 * Status options for a dropdown menu, each with its status dot. The statuses
 * in `locks` (what the order's invoice rules out) are disabled, with the reason
 * under them: a disabled item gets no hover, so a tooltip wouldn't show.
 */
export function OrderStatusRadioGroup({
  value,
  onValueChange,
  locks = [],
}: {
  value: OrderStatus
  onValueChange: (status: OrderStatus) => void
  locks?: OrderStatusLock[]
}) {
  return (
    <DropdownMenuRadioGroup
      value={value}
      onValueChange={(status) => onValueChange(status as OrderStatus)}
    >
      {orderStatusOptions.map((opt) => {
        const lock = locks.find((lock) => lock.status === opt.value)
        return (
          <DropdownMenuRadioItem
            key={opt.value}
            value={opt.value}
            disabled={!!lock}
          >
            {opt.icon}
            <span className="flex flex-col">
              {opt.label}
              {lock && (
                <span className="max-w-56 text-xs text-muted-foreground">
                  {lock.reason}
                </span>
              )}
            </span>
          </DropdownMenuRadioItem>
        )
      })}
    </DropdownMenuRadioGroup>
  )
}
