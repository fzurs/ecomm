"use client"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ordersRetrieveOptions } from "@workspace/api-client/query"
import { format } from "date-fns"
import { useParams } from "next/navigation"
import { OrderItemsTable, OrderStatusBadge } from "../columns"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import { CalendarIcon } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Separator } from "@workspace/ui/components/separator"

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
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="typeset">
              <h1>{order.number}</h1>
              <p className="flex items-center gap-2.5 text-muted-foreground">
                <CalendarIcon className="size-4" />
                {format(order.created_at, "MMMM dd, yyyy - p")}
              </p>
            </div>
            {order.status && (
              <OrderStatusBadge
                status={order.status}
                className="px-2.5 py-1.5 text-sm"
              />
            )}
          </div>
          <Separator />
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
          <Separator />
          <section>
            <div className="typeset">
              <h2>Customer details</h2>
            </div>
            <Item>
              <ItemMedia variant="image">
                <Avatar size="lg">
                  {customer.image && <AvatarImage src={customer.image} />}
                  <AvatarFallback />
                </Avatar>
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
