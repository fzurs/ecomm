"use client"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ordersRetrieveOptions } from "@workspace/api-client/query"
import { format } from "date-fns"
import { useParams } from "next/navigation"
import { OrderItemsTable } from "../_components/order-items-table"
import {
  OrderInvoiceStatusBadge,
  showsInvoiceStatus,
} from "../_components/order-invoice-status-badge"
import { OrderStatusBadge } from "../_components/order-status-badge"
import { OrderStatusMenu } from "../_components/order-status-menu"
import { OrderCustomerItem } from "../_components/order-customer-item"
import {
  OrderInvoiceButton,
  OrderInvoices,
} from "../_components/order-invoices"
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
        {/* As the invoice detail: one column; on a wide main, the header and
            customer on a fixed left column and the items on the right. The
            DOM keeps the one-column order: the grid places them. */}
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6 @5xl/main:grid @5xl/main:grid-cols-[26rem_minmax(0,1fr)] @5xl/main:grid-rows-[auto_1fr] @5xl/main:items-start @5xl/main:gap-x-10">
          {/* Header */}
          <div className="flex flex-col gap-6 @5xl/main:col-start-1 @5xl/main:row-start-1">
            <div className="flex flex-col gap-4">
              <div className="typeset">
                <h1>{order.number}</h1>
                <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="size-4" />
                  {format(order.created_at, "MMMM dd, yyyy - p")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {order.status && <OrderStatusBadge status={order.status} />}
                {showsInvoiceStatus(order) && (
                  <OrderInvoiceStatusBadge order={order} />
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <OrderStatusMenu order={order} />
              <OrderInvoiceButton order={order} />
            </div>
          </div>

          {/* The invoices are a table (or its empty state): they need the width. */}
          <div className="flex flex-col gap-6 @5xl/main:col-start-2 @5xl/main:row-span-2 @5xl/main:row-start-1">
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
                <h2>Invoices</h2>
              </div>
              <OrderInvoices order={order} />
            </section>
          </div>

          <section className="flex flex-col gap-4 @5xl/main:col-start-1 @5xl/main:row-start-2">
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
