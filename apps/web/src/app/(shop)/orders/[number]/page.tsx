import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ProductImage } from "@/components/product-image"
import { getMyOrder } from "@/lib/dal"
import { formatPrice } from "@/lib/format"
import { orderStatuses } from "@/lib/order-status"
import { provinces } from "@/lib/shipping"
import { PaymentStatus } from "./_components/payment-status"

export const metadata = { title: "Order" }

/** An order of the visitor's: their account's, or a guest's of this session. */
export default function OrderPage({
  params,
  searchParams,
}: PageProps<"/orders/[number]">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <OrderDetails params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function OrderDetails({
  params,
  searchParams,
}: PageProps<"/orders/[number]">) {
  const order = await getMyOrder((await params).number)
  // Someone else's looks the same as one that doesn't exist.
  if (!order) notFound()
  // Mercado Pago comes back here with the payment's status (its back URLs).
  const returned = (await searchParams).status
  const status = order.status ? orderStatuses[order.status] : null

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="typeset">
          <h1>Order {order.number}</h1>
          <p className="text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString("en", {
              dateStyle: "long",
            })}
          </p>
        </div>
        {status && <Badge variant={status.variant}>{status.label}</Badge>}
      </div>

      <PaymentStatus
        order={order}
        returned={typeof returned === "string" ? returned : null}
      />

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ul className="flex flex-col gap-3">
            {order.items.map(({ product, quantity, unit_price, subtotal }) => (
              <li key={product.id} className="flex items-center gap-3 text-sm">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  sizes="56px"
                  className="w-14 shrink-0 bg-white ring-1 ring-foreground/10"
                />
                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/product/${product.slug}`}
                    className="line-clamp-2 underline-offset-4 hover:underline"
                  >
                    {product.name}
                  </Link>
                  <span className="text-muted-foreground tabular-nums">
                    {quantity} × {formatPrice(unit_price)}
                  </span>
                </div>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">
                {formatPrice(order.items_subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {order.shipping_method === "pickup" ? "Pickup" : "Shipping"}
              </span>
              <span className="tabular-nums">
                {order.shipping_cost
                  ? formatPrice(order.shipping_cost)
                  : "Free"}
              </span>
            </div>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{order.customer.name}</p>
            <p className="text-muted-foreground">{order.customer.email}</p>
          </CardContent>
        </Card>
        {order.shipping_method === "pickup" ? (
          <Card size="sm">
            <CardHeader>
              <CardTitle>Pick it up at</CardTitle>
            </CardHeader>
            <CardContent className="text-sm whitespace-pre-line">
              {order.pickup_address || "—"}
            </CardContent>
          </Card>
        ) : (
          <Card size="sm">
            <CardHeader>
              <CardTitle>Shipping to</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p className="whitespace-pre-line">
                {order.shipping_address || "—"}
                {order.shipping_province &&
                  `\n${provinces[order.shipping_province]}`}
              </p>
              {(order.carrier || order.tracking_number) && (
                <p className="text-muted-foreground">
                  {[order.carrier, order.tracking_number]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Paid: it can be revoked (the API checks the 10 days). */}
      {order.status &&
        ["paid", "shipped", "delivered"].includes(order.status) && (
          <p className="text-sm text-muted-foreground">
            Changed your mind?{" "}
            <Link
              href={`/revocation?order=${order.number}`}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Revoke this purchase
            </Link>{" "}
            within 10 days of receiving it.
          </p>
        )}
    </div>
  )
}
