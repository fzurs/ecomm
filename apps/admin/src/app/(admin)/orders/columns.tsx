import { snakeCaseToTitle } from "@/lib/utils"
import { IconDots } from "@tabler/icons-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import {
  Order,
  OrderItem,
  OrderStatus,
  PaginatedOrderList,
} from "@workspace/api-client"
import {
  ordersDestroyMutation,
  ordersListQueryKey,
} from "@workspace/api-client/query"
import { zOrderStatus } from "@workspace/api-client/zod"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
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
import { cn } from "@workspace/ui/lib/utils"
import { Loader, Package } from "lucide-react"
import Link from "next/link"
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
    id: "id",
    accessorKey: "id",
    header: "Number of order",
  },
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
    cell: ({ row }) => {
      const orderItems = row.original.items
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost">
              <Package />x {orderItems.length}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1" side="right">
            <OrderItemsTableViewer orderItems={orderItems} size="sm" />
          </PopoverContent>
        </Popover>
      )
    },
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
      <div className="pr-2 text-right">$ {row.original.total || "-"}</div>
    ),
  },
  {
    id: "actions",
    cell: function TableCellActions({ row }) {
      const order = row.original
      const onDestroy = useOptimisticOrderDestroy(order)

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="ghost">
              <IconDots />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={`/orders/${order.id}/edit`}>Edit</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Danger zone</DropdownMenuLabel>
              <DropdownMenuItem variant="destructive" onClick={onDestroy}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function OrderItemsTableViewer({
  orderItems,
  renderQuantityCell,
  renderActionsCell,
  size = "md",
  children,
}: {
  orderItems: OrderItem[]
  renderQuantityCell?: (index: number) => React.ReactNode
  renderActionsCell?: (index: number) => React.ReactNode
  children?: React.ReactNode
  size?: "sm" | "md"
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className={cn(size === "sm" && "text-xs [&_th]:h-6")}>
          <TableHead>Product</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
          {renderActionsCell && <TableHead />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orderItems.map(
          ({ product_detail: product, subtotal, quantity }, index) => (
            <TableRow key={index}>
              <TableCell>{product.name}</TableCell>
              <TableCell className="text-right">
                {renderQuantityCell?.(index) ?? quantity}
              </TableCell>
              <TableCell className="text-right">{product.price}</TableCell>
              <TableCell className="text-right">{subtotal}</TableCell>
              {renderActionsCell && (
                <TableCell className="text-right">
                  {renderActionsCell(index)}
                </TableCell>
              )}
            </TableRow>
          )
        )}
      </TableBody>
      {children}
    </Table>
  )
}

function useOptimisticOrderDestroy(order: Order) {
  const queryClient = useQueryClient()
  const queryKey = ordersListQueryKey()
  const destroyMutation = useMutation({
    ...ordersDestroyMutation(),
    onMutate: () => {
      queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)
      queryClient.setQueriesData({ queryKey }, (old: PaginatedOrderList) => {
        if (!old) return old
        return {
          ...old,
          results: old.results.filter((item) => item.id !== order.id),
        }
      })
      return { previousData }
    },
    onError: (err, _, onMutateResult) => {
      queryClient.setQueryData(queryKey, onMutateResult?.previousData)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
  const onDestroy = () => destroyMutation.mutate({ path: { id: order.id } })
  return onDestroy
}
