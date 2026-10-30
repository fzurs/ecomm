import { Badge } from "@workspace/ui/components/badge"
import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"
import { getMyOrders } from "@/lib/dal"
import { formatPrice } from "@/lib/format"
import { orderStatuses } from "@/lib/order-status"

/** The customer's orders, newest first, each linking to its page. */
export async function OrderList() {
  const orders = await getMyOrders()

  if (!orders.length) {
    return (
      <p className="text-sm text-muted-foreground">
        You haven&apos;t ordered anything yet.{" "}
        <Link href="/" className="text-foreground underline underline-offset-4">
          Browse products
        </Link>
      </p>
    )
  }

  return (
    <ul className="-mx-2 flex flex-col">
      {orders.map((order) => {
        const status = order.status ? orderStatuses[order.status] : null
        return (
          <li key={order.number}>
            <Link
              href={`/orders/${order.number}`}
              className="flex items-center gap-3 rounded-md p-2 text-sm hover:bg-muted"
            >
              <div className="flex flex-1 flex-col">
                <span className="font-medium">{order.number}</span>
                <span className="text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en", {
                    dateStyle: "medium",
                  })}
                </span>
              </div>
              {status && <Badge variant={status.variant}>{status.label}</Badge>}
              <span className="w-24 text-right tabular-nums">
                {formatPrice(order.total)}
              </span>
              <ChevronRightIcon className="size-4 text-muted-foreground" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
