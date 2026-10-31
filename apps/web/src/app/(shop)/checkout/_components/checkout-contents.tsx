import Link from "next/link"
import { redirect } from "next/navigation"
import { ProductImage } from "@/components/product-image"
import { getShippingOptions } from "@/lib/cache"
import { getCart, getUser } from "@/lib/dal"
import { formatPrice } from "@/lib/format"
import { withNext } from "@/lib/navigation"
import { CheckoutForm } from "./checkout-form"

export async function CheckoutContents() {
  const [cart, user, shipping] = await Promise.all([
    getCart(),
    getUser(),
    getShippingOptions(),
  ])
  // Nothing to buy, or something the cart page asks to take out first.
  if (!cart.items.length || cart.items.some((item) => !item.available)) {
    redirect("/cart")
  }
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ")

  return (
    <CheckoutForm
      email={user?.email}
      name={name || undefined}
      shipping={shipping}
      subtotal={cart.total}
      signIn={
        !user && (
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
        )
      }
      items={
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
      }
    />
  )
}
