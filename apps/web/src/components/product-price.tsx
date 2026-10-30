import { Product } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "cn"
import { formatPrice } from "@/lib/format"

/** The price with the discount, and the one before it crossed out. Nothing without a price. */
export function ProductPrice({
  product: {
    price,
    discount_percent: discountPercent,
    active_price: activePrice,
  },
  size = "md",
  className,
}: {
  product: Product
  size?: "lg" | "md"
  className?: string
}) {
  if (activePrice == null) return null
  const isDiscount = !!price && !!discountPercent

  return (
    <div className={cn("flex flex-col", className)}>
      {isDiscount && (
        <span
          className={cn(
            "text-muted-foreground line-through",
            size === "lg" ? "text-sm" : "text-xs"
          )}
        >
          {formatPrice(price)}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "font-semibold tabular-nums",
            size === "lg" ? "text-3xl" : "text-lg"
          )}
        >
          {formatPrice(activePrice)}
        </span>
        {isDiscount && (
          <Badge variant="secondary" className={cn(size === "lg" && "text-sm")}>
            {discountPercent}% OFF
          </Badge>
        )}
      </div>
    </div>
  )
}
