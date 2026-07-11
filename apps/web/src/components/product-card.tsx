import { Product } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import React from "react"
import { ProductPrice } from "./product-price"

export function ProductCard({
  product,
  className,
  ...props
}: React.ComponentProps<typeof Card> & {
  product: Product
}) {
  return (
    <Card className={cn("pt-0", className)} {...props}>
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
        <ProductPrice {...product} />
      </CardFooter>
    </Card>
  )
}
