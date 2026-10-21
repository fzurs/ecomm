"use client"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ordersRetrieveOptions } from "@workspace/api-client/query"
import { format } from "date-fns"
import { useParams } from "next/navigation"
import { OrderItemsTable } from "../_components/order-items-table"
import { OrderStatusBadge } from "../_components/order-status-badge"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import { CalendarIcon, EditIcon, EyeIcon, MailIcon } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import Link from "next/link"

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
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="typeset">
              <h1>{order.number}</h1>
              <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="size-4" />
                {format(order.created_at, "MMMM dd, yyyy - p")}
              </p>
            </div>
            {order.status && (
              <OrderStatusBadge
                status={order.status}
                // className="px-2.5 py-1.5 text-sm"
              />
            )}
          </div>
          <div>
            <Button variant="outline">
              <EditIcon />
              Change status
            </Button>
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
            <Item variant="muted">
              <ItemMedia variant="image">
                <Avatar size="lg">
                  {customer.image && <AvatarImage src={customer.image} />}
                  <AvatarFallback />
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{customer.name}</ItemTitle>
                <ItemDescription className="flex items-center gap-2">
                  <MailIcon className="size-4" />
                  {customer.email}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Link
                  href={`/customers/${customer.id}`}
                  className={buttonVariants({ variant: "ghost" })}
                >
                  <EyeIcon />
                  <span>View details</span>
                </Link>
              </ItemActions>
            </Item>
          </section>
        </div>
      </main>
    </>
  )
}
