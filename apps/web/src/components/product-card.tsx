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
          // The grid's columns (products-grid.tsx): 4, 3, 2 or 1 by its width.
          sizes="(min-width: 1088px) 300px, (min-width: 720px) 33vw, (min-width: 416px) 50vw, 100vw"
          className="bg-white transition-transform group-hover/product:scale-[1.02]"
        />
        {product.stock === 0 && (
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
