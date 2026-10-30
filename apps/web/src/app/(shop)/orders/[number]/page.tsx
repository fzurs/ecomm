import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { CircleCheckIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ProductImage } from "@/components/product-image"
import { getMyOrder } from "@/lib/dal"
import { formatPrice } from "@/lib/format"
import { orderStatuses } from "@/lib/order-status"

export const metadata = { title: "Order" }

/** An order of the visitor's: their account's, or a guest's of this session. */
export default function OrderPage({ params }: PageProps<"/orders/[number]">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <OrderDetails params={params} />
    </Suspense>
  )
}

async function OrderDetails({
  params,
}: {
  params: PageProps<"/orders/[number]">["params"]
}) {
  const order = await getMyOrder((await params).number)
  // Someone else's looks the same as one that doesn't exist.
  if (!order) notFound()
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

      {order.status === "pending" && (
        <div className="flex gap-3 rounded-xl bg-muted p-4 text-sm">
          <CircleCheckIcon className="size-5 shrink-0 text-primary" />
          <p>
            Thank you! We received your order and sent the details to{" "}
            <strong>{order.customer.email}</strong>. We&apos;ll write to you
            soon to arrange the payment and the delivery.
          </p>
        </div>
      )}

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
          <div className="flex justify-between border-t pt-3 font-semibold">
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
        <Card size="sm">
          <CardHeader>
            <CardTitle>Shipping to</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-line">
            {order.shipping_address || "—"}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
