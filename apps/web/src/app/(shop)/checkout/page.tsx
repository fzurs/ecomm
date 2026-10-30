import { Skeleton } from "@workspace/ui/components/skeleton"
import { Suspense } from "react"
import { CheckoutContents } from "./_components/checkout-contents"

export const metadata = { title: "Checkout" }

/** Guests buy too: no session needed (proxy.ts doesn't guard it). */
export default function CheckoutPage() {
  return (
    <>
      <div className="typeset">
        <h1>Checkout</h1>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <CheckoutContents />
      </Suspense>
    </>
  )
}
