import { Product } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "cn"
import { formatPrice } from "@/lib/utils"

/** The final price, with the list price struck through when a discount applies. */
export function ProductPrice({
  product,
  className,
  ...props
}: { product: Product } & React.ComponentProps<"p">) {
  const activePrice = formatPrice(product.active_price)
  const discounted =
    !!product.discount_percent && product.active_price !== product.price

  return (
    <p
      className={cn(
        "flex flex-wrap items-baseline gap-2 tabular-nums",
        className
      )}
      {...props}
    >
      {activePrice ? (
        <span className="text-xl font-semibold">{activePrice}</span>
      ) : (
        <span className="text-muted-foreground">No price</span>
      )}
      {discounted && (
        <>
          <span className="text-muted-foreground line-through">
            {formatPrice(product.price)}
          </span>
          <Badge variant="secondary" className="self-center">
            −{product.discount_percent}%
          </Badge>
        </>
      )}
    </p>
  )
}
