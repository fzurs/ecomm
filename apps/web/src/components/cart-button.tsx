"use client"
import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "cn"
import { ShoppingCartIcon } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { CartContext } from "./cart-provider"

/** The header's link to the cart, with how many units it has. */
export function CartButton() {
  return (
    <Link
      href="/cart"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative"
      )}
    >
      <ShoppingCartIcon />
      <React.Suspense fallback={<span className="sr-only">Cart</span>}>
        <CartCount />
      </React.Suspense>
    </Link>
  )
}

function CartCount() {
  const cartPromise = React.useContext(CartContext)
  const count = cartPromise ? React.use(cartPromise).count : 0
  return (
    <>
      <span className="sr-only">
        Cart, {count} {count === 1 ? "item" : "items"}
      </span>
      {count > 0 && (
        <Badge
          aria-hidden
          className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </>
  )
}
