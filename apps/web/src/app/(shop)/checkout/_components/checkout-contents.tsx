import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ProductImage } from "@/components/product-image"
import { getCart, getUser } from "@/lib/dal"
import { formatPrice } from "@/lib/format"
import { withNext } from "@/lib/navigation"
import { CheckoutForm } from "./checkout-form"

export async function CheckoutContents() {
  const [cart, user] = await Promise.all([getCart(), getUser()])
  // Nothing to buy, or something the cart page asks to take out first.
  if (!cart.items.length || cart.items.some((item) => !item.available)) {
    redirect("/cart")
  }
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ")

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-6">
        {!user && (
          <p className="text-sm text-muted-foreground">
            Have an account?{" "}
            <Link
              href={withNext("/login", "/checkout")}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign in
            </Link>{" "}
            to see your orders later. Or just go on as a guest.
          </p>
        )}
        <CheckoutForm email={user?.email} name={name || undefined} />
      </div>
      <Card className="lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle>Your order</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {cart.items.map(({ product, quantity, subtotal }) => (
              <li key={product.id} className="flex items-center gap-3 text-sm">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  sizes="48px"
                  className="w-12 shrink-0 bg-white ring-1 ring-foreground/10"
                />
                <span className="line-clamp-2 flex-1">
                  {quantity} × {product.name}
                </span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-1">
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(cart.total)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Shipping and payment are arranged by email after the order.
          </p>
          <Link
            href="/cart"
            className="mt-2 text-sm underline-offset-4 hover:underline"
          >
            Edit cart
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
