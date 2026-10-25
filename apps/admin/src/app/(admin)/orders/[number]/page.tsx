"use client"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ordersRetrieveOptions } from "@workspace/api-client/query"
import { format } from "date-fns"
import { useParams } from "next/navigation"
import { OrderItemsTable } from "../_components/order-items-table"
import { OrderStatusBadge } from "../_components/order-status-badge"
import { OrderStatusMenu } from "../_components/order-status-menu"
import { OrderCustomerItem } from "../_components/order-customer-item"
import { CalendarIcon } from "lucide-react"

export default function OrdersDetailsPage() {
  const params = useParams<{ number: string }>()
  const query = useSuspenseQuery(ordersRetrieveOptions({ path: params }))
  const order = query.data

  return (
    <>
      <AppHeader>
        <AppHeaderNav
          parents={[{ label: "Orders", href: "/orders" }]}
          page={order.number}
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col">
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="typeset">
              <h1>{order.number}</h1>
              <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="size-4" />
                {format(order.created_at, "MMMM dd, yyyy - p")}
              </p>
            </div>
            {order.status && <OrderStatusBadge status={order.status} />}
          </div>

          <div>
            <OrderStatusMenu order={order} />
          </div>

          <section className="flex flex-col gap-4">
            <div className="typeset">
              <h2>Order items</h2>
            </div>
            <OrderItemsTable
              orderItems={order.items}
              total={order.total}
              showTotal
            />
          </section>
          <section className="flex flex-col gap-4">
            <div className="typeset">
              <h2>Customer details</h2>
            </div>
            <OrderCustomerItem customer={order.customer_detail} />
          </section>
        </div>
      </main>
    </>
  )
}
