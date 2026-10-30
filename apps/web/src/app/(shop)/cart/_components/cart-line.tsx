"use client"
import type { CartItem } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
import { cn } from "cn"
import { Trash2Icon } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"
import { ProductImage } from "@/components/product-image"
import { QuantityInput } from "@/components/quantity-input"
import { formatPrice } from "@/lib/format"
import { removeCartItem, updateCartItem } from "../actions"

/** A product in the cart: its quantity changes, or it goes, right away. */
export function CartLine({ item }: { item: CartItem }) {
  const { product } = item
  const [pending, startTransition] = React.useTransition()
  // The new quantity shows while Django saves it.
  const [quantity, setQuantity] = React.useOptimistic(item.quantity)

  function change(next: number) {
    startTransition(async () => {
      setQuantity(next)
      const { error } = await updateCartItem(product.id, next)
      if (error) toast.error(error)
    })
  }

  function remove() {
    startTransition(async () => {
      const { error } = await removeCartItem(product.id)
      if (error) toast.error(error)
    })
  }

  return (
    <div
      className={cn(
        "flex gap-4 p-4 transition-opacity",
        pending && "opacity-60"
      )}
    >
      <Link href={`/product/${product.slug}`} className="w-20 shrink-0">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="bg-white ring-1 ring-foreground/10"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/product/${product.slug}`}
            className="line-clamp-2 font-medium underline-offset-4 hover:underline"
          >
            {product.name}
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={remove}
            disabled={pending}
            aria-label={`Remove ${product.name}`}
          >
            <Trash2Icon />
          </Button>
        </div>
        {item.available ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <QuantityInput
              value={quantity}
              onChange={change}
              disabled={pending}
            />
            <div className="text-right">
              <div className="font-semibold tabular-nums">
                {formatPrice(item.subtotal)}
              </div>
              {quantity > 1 && (
                <div className="text-xs text-muted-foreground tabular-nums">
                  {formatPrice(product.active_price)} each
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-destructive">
            No longer available. Remove it to continue.
          </p>
        )}
      </div>
    </div>
  )
}
