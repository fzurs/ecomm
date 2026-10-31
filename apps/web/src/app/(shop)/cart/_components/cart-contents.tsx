import { buttonVariants } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { cn } from "cn"
import { ShoppingCartIcon } from "lucide-react"
import Link from "next/link"
import { getCart } from "@/lib/dal"
import { formatPrice } from "@/lib/format"
import { CartLine } from "./cart-line"

export async function CartContents() {
  const cart = await getCart()

  if (!cart.items.length) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShoppingCartIcon />
          </EmptyMedia>
          <EmptyTitle>Your cart is empty</EmptyTitle>
          <EmptyDescription>
            Find something you like and add it here.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/" className={buttonVariants()}>
            Browse products
          </Link>
        </EmptyContent>
      </Empty>
    )
  }

  const unavailable = cart.items.some((item) => !item.available)

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <ul className="divide-y rounded-xl ring-1 ring-foreground/10">
        {cart.items.map((item) => (
          <li key={item.product.id}>
            <CartLine item={item} />
          </li>
        ))}
      </ul>
      <Card className="lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {cart.count} {cart.count === 1 ? "item" : "items"}
            </span>
            <span className="tabular-nums">{formatPrice(cart.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(cart.total)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {unavailable && (
            <p className="text-sm text-destructive">
              Remove the products that are no longer available, or lower their
              quantity, to continue.
            </p>
          )}
          <Link
            href="/checkout"
            aria-disabled={unavailable || undefined}
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full",
              unavailable && "pointer-events-none opacity-50"
            )}
          >
            Checkout
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
