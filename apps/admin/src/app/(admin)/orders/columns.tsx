import { snakeCaseToTitle } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { Order, OrderStatus } from "@workspace/api-client"
import { zOrderStatus } from "@workspace/api-client/zod"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Empty, EmptyHeader, EmptyTitle } from "@workspace/ui/components/empty"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Loader, Package } from "lucide-react"
import React from "react"

export function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case "pending":
      return <Loader />
    default:
      return null
  }
}

export const statusOptions = zOrderStatus.options.map((status) => {
  return {
    label: snakeCaseToTitle(status),
    value: status,
    icon: getStatusIcon(status),
  }
})

export const columns: ColumnDef<Order>[] = [
  {
    id: "customer",
    accessorKey: "customer_detail",
    header: "Customer",
    cell: ({ row }) => (
      <div className="font-semibold">{row.original.customer_detail.name}</div>
    ),
    enableHiding: false,
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => <TableCellItemsPopover items={row.original.items} />,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const statusOption = statusOptions.find((o) => o.value === status)
      if (!statusOption) return null
      return (
        <Badge variant="outline">
          {statusOption.icon} {statusOption.label}
        </Badge>
      )
    },
  },
  {
    id: "total",
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <div className="text-right pr-2">$ {row.original.total || "-"}</div>
    ),
  },
]

export function TableCellItemsPopover({ items }: { items: Order["items"] }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost">
          <Package />x {items.length}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1" align="start">
        <Table>
          <TableHeader className="text-xs [&_th]:h-6">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product_detail.name}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{item.unit_price}</TableCell>
                <TableCell className="text-right">{item.subtotal}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {items.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle className="text-sm">No items</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </PopoverContent>
    </Popover>
  )
}
