"use client"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ordersRetrieveOptions } from "@workspace/api-client/query"
import { format } from "date-fns"
import { useParams } from "next/navigation"
import { OrderItemsTable, CustomerAvatar, OrderStatusBadge } from "../columns"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import { CalendarIcon } from "lucide-react"

export default function OrdersDetailsPage() {
  const params = useParams<{ number: string }>()
  const query = useSuspenseQuery(ordersRetrieveOptions({ path: params }))
  const order = query.data
  const customer = order.customer_detail

  return (
    <>
      <AppHeader>
        <AppHeaderNav
          items={[
            { label: "Orders", href: "/orders", type: "link" },
            { label: order.number, type: "page" },
          ]}
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col">
        <div className="typeset flex flex-col px-4 py-6 lg:px-6">
          <div className="typeset flex items-start justify-between gap-4">
            <div>
              <h1>{order.number}</h1>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground [&>svg]:size-3.5">
                <CalendarIcon />
                <span>{format(order.created_at, "MMMM dd, yyyy - p")}</span>
              </div>
            </div>
            {order.status && (
              <OrderStatusBadge
                status={order.status}
                className="px-2.5 py-1.5 text-sm"
              />
            )}
          </div>
          <section className="flex flex-col gap-4">
            <h2>Order items</h2>
            <div className="not-typeset">
              <OrderItemsTable
                orderItems={order.items}
                showTotal
                total={order.total}
              />
            </div>
          </section>
          <section className="flex flex-col gap-4">
            <h2>Customer details</h2>
            <Item className="not-typeset p-0">
              <ItemMedia variant="image">
                <CustomerAvatar customer={customer} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{customer.name}</ItemTitle>
                <ItemDescription>{customer.email}</ItemDescription>
              </ItemContent>
            </Item>
          </section>
        </div>
      </main>
    </>
  )
}
