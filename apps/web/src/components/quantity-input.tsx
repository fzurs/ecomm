"use client"
import { Button } from "@workspace/ui/components/button"
import { cn } from "cn"
import { MinusIcon, PlusIcon } from "lucide-react"

// The API's limit for one product in the cart (checkout.models.MAX_QUANTITY).
export const MAX_QUANTITY = 99

/** A quantity between 1 and `max` (MAX_QUANTITY, or the stock), with − and +
 * buttons. */
export function QuantityInput({
  value,
  onChange,
  max = MAX_QUANTITY,
  disabled,
  label = "Quantity",
  className,
}: {
  value: number
  onChange: (value: number) => void
  max?: number
  disabled?: boolean
  label?: string
  className?: string
}) {
  const set = (next: number) =>
    onChange(Math.min(Math.max(Math.trunc(next) || 1, 1), max))

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex h-9 w-fit items-center rounded-md border shadow-xs",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled || value <= 1}
        onClick={() => set(value - 1)}
        aria-label="Fewer"
      >
        <MinusIcon />
      </Button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => set(Number(event.target.value))}
        aria-label={label}
        className="w-10 [appearance:textfield] bg-transparent text-center text-sm tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled || value >= max}
        onClick={() => set(value + 1)}
        aria-label="More"
      >
        <PlusIcon />
      </Button>
    </div>
  )
}
