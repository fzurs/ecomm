import { Product } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "cn"
import React from "react"
import { ProductImage } from "./product-image"
import { ProductPrice } from "./product-price"

export function ProductCard({
  product,
  className,
  ...props
}: React.ComponentProps<typeof Card> & {
  product: Product
}) {
  return (
    <Card size="sm" className={cn("h-full", className)} {...props}>
      <div className="relative px-(--card-spacing)">
        <ProductImage
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="bg-white transition-transform group-hover/product:scale-[1.02]"
        />
        {product.status === "out_of_stock" && (
          <Badge variant="destructive" className="absolute top-2 left-6">
            Out of stock
          </Badge>
        )}
      </div>
      <CardHeader>
        {product.brand && (
          <CardDescription>{product.brand.name}</CardDescription>
        )}
        <CardTitle className="line-clamp-2 group-hover/product:underline">
          {product.name}
        </CardTitle>
      </CardHeader>
      <CardFooter className="mt-auto">
        <ProductPrice product={product} />
      </CardFooter>
    </Card>
  )
}
