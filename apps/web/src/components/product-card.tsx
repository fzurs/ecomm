import { isOutOfStock as isProudctOutOfStock } from "@/lib/utils"
import { schemas } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import React from "react"
import z from "zod"
import { OutOfStockAlert } from "./out-of-stock-alert"
import { cn } from "@workspace/ui/lib/utils"

export function ProductCard({
  product,
  className,
  ...props
}: React.ComponentProps<typeof Card> & {
  product: z.infer<typeof schemas.Product>
}) {
  const isOutOfStock = isProudctOutOfStock(product.status)
  return (
    <Card
      className={cn("grid aspect-square grid-rows-6", className)}
      {...props}
    >
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardAction>
          <span className="text-sm text-muted-foreground">
            {product.brand?.name}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="row-span-3 space-y-2 md:space-y-4">
        {product.description && (
          <CardDescription>{product.description}</CardDescription>
        )}
        {isOutOfStock && <OutOfStockAlert />}
      </CardContent>
      <CardFooter className="row-span-2 items-end">
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
