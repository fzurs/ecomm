import { Product } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "cn"

export function ProductPrice({
  size = "md",
  price,
  discount_percent: discountPercent,
  active_price: activePrice,
  slug,
}: Product & {
  size?: "lg" | "md"
}) {
  const isDiscount = !!price && !!discountPercent
  return (
    <section id={`${slug}-price`}>
      {isDiscount && (
        <span
          className={cn(
            "text-muted-foreground line-through",
            size === "lg" ? "text-sm" : "text-xs"
          )}
        >
          $ {price}
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className={cn(size === "lg" ? "text-2xl" : "text-xl")}>
          $ {activePrice || "---"}
        </span>
        {isDiscount && (
          <Badge variant="secondary" className={cn(size === "lg" && "text-sm")}>
            % {discountPercent} OFF
          </Badge>
        )}
      </div>
    </section>
  )
}
