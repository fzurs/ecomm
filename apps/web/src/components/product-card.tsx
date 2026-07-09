import { Product } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import React from "react"

export function ProductCard({
  product,
  className,
  ...props
}: React.ComponentProps<typeof Card> & {
  product: Product
}) {
  return (
    <Card className={cn("h-full pt-0", className)} {...props}>
      <img
        src={product.image ?? ""}
        className="aspect-video rounded-t-xl object-cover"
      />
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardAction>
          {product.status === "out_of_stock" && (
            <Badge variant="destructive">Out of stock</Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardFooter>
        {product.price &&
          (product.discount_price ? (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground line-through">
                $ {product.price}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  $ {product.price - product.discount_price}
                </span>
                <Badge variant="secondary">
                  {Math.ceil((product.discount_price * 100) / product.price)} %
                  OFF
                </Badge>
              </div>
            </div>
          ) : (
            <span className="text-xl">$ {product.price}</span>
          ))}
      </CardFooter>
    </Card>
  )
}
