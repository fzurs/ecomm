import { Product } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

export function ProductPrice({
  size = "md",
  price,
  discount_price: discountPrice,
  slug,
}: Product & {
  size?: "lg" | "md"
}) {
  const isDiscount = !!discountPrice && discountPrice > 0
  const discountPercentage =
    price && isDiscount ? Math.ceil((discountPrice * 100) / price) : null
  const finalPrice = price && isDiscount ? price - discountPrice : price
  return (
    <section id={`${slug}-price`}>
      {isDiscount && (
        <span
          className={cn(
            "text-muted-foreground line-through",
            size === "lg" ? "text-sm" : "text-xs"
          )}
        >
          $ {price ?? "---"}
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className={cn(size === "lg" ? "text-2xl" : "text-xl")}>
          $ {finalPrice || "---"}
        </span>
        {discountPercentage && (
          <Badge variant="secondary" className={cn(size === "lg" && "text-sm")}>
            % {discountPercentage} OFF
          </Badge>
        )}
      </div>
    </section>
  )
}
