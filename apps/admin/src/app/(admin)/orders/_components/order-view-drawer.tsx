import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { useRowActionDialog } from "@/context/row-actions-provider"
import { useQuery } from "@tanstack/react-query"
import { ordersRetrieveOptions } from "@workspace/api-client/query"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { Order } from "@workspace/api-client"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { CalendarIcon, Maximize2Icon } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { OrderCustomerItem } from "./order-customer-item"
import { OrderInvoiceButton, OrderInvoices } from "./order-invoices"
import {
  OrderInvoiceStatusBadge,
  showsInvoiceStatus,
} from "./order-invoice-status-badge"
import { OrderItemsTable } from "./order-items-table"
import { OrderStatusBadge } from "./order-status-badge"
import { OrderStatusMenu } from "./order-status-menu"

export function OrderViewDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps } = useRowActionDialog<Order>("view")

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"} {...rootProps}>
      <DrawerContent size="lg">
        {row && <OrderViewDrawerContent row={row} />}
      </DrawerContent>
    </Drawer>
  )
}

function OrderViewDrawerContent({ row }: { row: Order }) {
  // The detail query, not the table row: OrderStatusMenu updates it
  // optimistically, so a status change shows up here right away.
  const { data: order = row } = useQuery({
    ...ordersRetrieveOptions({ path: { number: row.number } }),
    placeholderData: row,
  })

  return (
    <>
      <DrawerHeader className="group-data-[swipe-axis=y]/drawer-popup:text-start">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-col gap-1">
              <DrawerTitle className="text-base">{order.number}</DrawerTitle>
              <DrawerDescription className="flex items-center gap-2">
                <CalendarIcon className="size-4" />
                {format(order.created_at, "MMMM dd, yyyy - p")}
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-2">
              {order.status && <OrderStatusBadge status={order.status} />}
              {showsInvoiceStatus(order) && (
                <OrderInvoiceStatusBadge order={order} />
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusMenu order={order} size="sm" />
            <OrderInvoiceButton order={order} size="sm" />
            <Link
              href={`/orders/${order.number}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Maximize2Icon />
              Open page
            </Link>
          </div>
        </div>
      </DrawerHeader>
      <div className="flex flex-1 scroll-fade flex-col gap-8 overflow-y-auto p-4 pt-8">
        <div className="flex flex-col gap-2">
          <div className="typeset">
            <h3>Order items</h3>
          </div>
          <OrderItemsTable
            orderItems={order.items}
            total={order.total}
            showTotal
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="typeset">
            <h3>Customer details</h3>
          </div>
          <OrderCustomerItem customer={order.customer_detail} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="typeset">
            <h3>Invoices</h3>
          </div>
          <OrderInvoices order={order} />
        </div>
      </div>
      <DrawerFooter>
        <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
      </DrawerFooter>
    </>
  )
}
