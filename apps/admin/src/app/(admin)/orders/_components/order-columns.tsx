import { formatPrice } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { Order } from "@workspace/api-client"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { format } from "date-fns"
import Link from "next/link"
import { orderStatusOptions } from "../_lib/order-status"
import { OrderItemsTable } from "./order-items-table"
import { OrderRowActions } from "./order-row-actions"
import { OrderStatusBadge } from "./order-status-badge"
import { cn } from "@workspace/ui/lib/utils"

export const orderColumns = [
  {
    accessorKey: "total",
    cell: ({ row }) => formatPrice(row.original.total),
    meta: {
      thClassName: "text-right",
      className: "text-right font-semibold",
    },
    enableHiding: false,
  },
  {
    id: "currency",
    cell: "PES",
    meta: { className: "text-muted-foreground font-medium" },
    enableHiding: false,
  },
  {
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status
      if (!status) return null
      return <OrderStatusBadge status={status} />
    },
    meta: { variant: "multi-select", options: orderStatusOptions },
  },
  {
    accessorKey: "number",
    header: "Order Number",
    enableSorting: false,
    meta: { className: "text-muted-foreground font-medium" },
  },
  {
    accessorKey: "items",
    cell: ({ row }) => {
      const orderItems = row.original.items
      return (
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="sm" className="font-normal" />
            }
          >
            {orderItems.length} item{orderItems.length > 1 && "s"}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1">
            <OrderItemsTable variant="compact" orderItems={orderItems} />
          </PopoverContent>
        </Popover>
      )
    },
    enableSorting: false,
    meta: {
      thClassName: "text-center",
      className: "text-center",
    },
  },
  {
    accessorKey: "customer",
    cell: ({ row }) => {
      const customer = row.original.customer_detail
      return (
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {customer.image && <AvatarImage src={customer.image} />}
            <AvatarFallback />
          </Avatar>
          <Link
            href={`/customers/${customer.id}`}
            className={cn(
              buttonVariants({
                variant: "link",
                size: "sm",
              }),
              "px-0"
            )}
          >
            {customer.name}
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => format(row.original.created_at, "MMM dd"),
    meta: { className: "text-muted-foreground" },
  },
  {
    id: "actions",
    cell: ({ row }) => <OrderRowActions item={row.original} />,
    enableHiding: false,
  },
] as const satisfies ColumnDef<Order>[]
