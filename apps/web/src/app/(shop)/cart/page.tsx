import { Skeleton } from "@workspace/ui/components/skeleton"
import { Suspense } from "react"
import { CartContents } from "./_components/cart-contents"

export const metadata = { title: "Cart" }

export default function CartPage() {
  return (
    <>
      <div className="typeset">
        <h1>Cart</h1>
      </div>
      {/* The cart is the visitor's: dynamic, read with their cookies. */}
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <CartContents />
      </Suspense>
    </>
  )
}
