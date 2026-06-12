import { isOutOfStock } from "@/lib/utils"
import { schemas } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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
  return (
    <Card
      className={cn(isOutOfStock(product.status) && "pt-0", className)}
      {...props}
    >
      {isOutOfStock(product.status) && (
        <OutOfStockAlert className="rounded-b-none border-0" />
      )}
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
        <CardAction>
          <span className="text-sm text-muted-foreground">
            {product.brand?.name}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
