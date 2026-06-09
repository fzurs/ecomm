import { schemas } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import React from "react"
import z from "zod"

export function ProductCard({
  product,
  ...props
}: React.ComponentProps<typeof Card> & {
  product: z.infer<typeof schemas.Product>
}) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
        <CardAction>
          <span className="text-sm text-muted-foreground">
            {product.brand?.name}
          </span>
        </CardAction>
      </CardHeader>
      <CardFooter className="mt-auto">
        {product.price &&
          (product.discount_price ? (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground line-through">
                $ {product.price}
              </span>
              <div className="flex gap-2">
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
