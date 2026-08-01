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
  ordersPartialUpdateMutation,
} from "@workspace/api-client/query"
import { zOrderStatus } from "@workspace/api-client/zod"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { format } from "date-fns"
import { EllipsisIcon, RefreshCw, Trash2Icon, ViewIcon } from "lucide-react"
import React, { useState } from "react"

const statusClasses: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-900 dark:text-yellow-400",
  paid: "bg-green-500/15 text-green-900 dark:text-green-400",
  shipped: "bg-blue-500/15 text-blue-900 dark:text-blue-400",
  delivered: "bg-emerald-500/15 text-emerald-900 dark:text-emerald-400",
  cancelled: "bg-red-500/15 text-red-900 dark:text-red-400",
}

export const columns = [
  {
    accessorKey: "total",
    cell: ({ row }) => `$${row.original.total}`,
    meta: {
      thClassName: "text-right",
      className: "text-right font-semibold",
      variant: "number",
    },
    enableHiding: false,
    enableColumnFilter: true,
  },
  {
    id: "currency",
    cell: "USD",
    meta: { className: "text-muted-foreground font-medium" },
    enableHiding: false,
  },
  {
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status || "pending"
      return (
        <Badge
          className={cn("h-6 rounded-md capitalize", statusClasses[status])}
        >
          {status}
        </Badge>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "id",
    header: "Order Number",
    cell: ({ row }) => `C654523-00${row.original.id}`,
    meta: { className: "text-muted-foreground font-medium" },
  },
  {
    accessorKey: "items",
    cell: ({ row }) => {
      const orderItems = row.original.items
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="font-normal">
              {orderItems.length} item{orderItems.length > 1 && "s"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1">
            <OrderItemsTable orderItems={orderItems} className="[&_th]:h-6" />
          </PopoverContent>
        </Popover>
      )
    },
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
        <div>
          <div className="font-medium">{customer.name}</div>
          <div className="text-muted-foreground">{customer.email}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => format(row.original.updated_at, "MMM dd"),
    meta: { className: "text-muted-foreground" },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => format(row.original.created_at, "MMM dd, p"),
    meta: { className: "text-muted-foreground" },
  },
  {
    id: "actions",
    cell: ({ row }) => <TableCellActions item={row.original} />,
    enableHiding: false,
  },
] as const satisfies ColumnDef<Order>[]

export function OrderItemsTable({
  orderItems,
  renderActions,
  renderQuantity,
  children,
  className,
}: {
  orderItems: OrderItem[]
  renderActions?: (index: number) => React.ReactNode
  renderQuantity?: (index: number) => React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="text-center">Quantity</TableHead>
          <TableHead className="text-center">Unit Price</TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
          {renderActions && <TableHead />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orderItems.map(
          ({ product_detail: product, quantity, subtotal }, index) => (
            <TableRow key={index}>
              <TableCell>{product.name}</TableCell>
              <TableCell className="text-center">
                {renderQuantity?.(index) ?? quantity}
              </TableCell>
              <TableCell className="text-center">${product.price}</TableCell>
              <TableCell className="text-right font-semibold">
                ${subtotal}
              </TableCell>
              {renderActions && (
                <TableCell className="text-right">
                  {renderActions(index)}
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

function useOptimisticOrderUpdate(order: Order) {
  const queryClient = useQueryClient()
  const queryKey = ordersListQueryKey()

  return useMutation({
    ...ordersPartialUpdateMutation(),
    onMutate: (data) => {
      queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)
      queryClient.setQueriesData({ queryKey }, (old: PaginatedOrderList) => {
        if (!old) return old
        return {
          ...old,
          results: old.results.map((item) =>
            item.id === order.id ? { ...order, ...data } : item
          ),
        }
      })
      return { previousData }
    },
    onError: (err, _, onMutateResult) =>
      queryClient.setQueryData(queryKey, onMutateResult?.previousData),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}

function useOptimisticOrderDestroy(order: Order) {
  const queryClient = useQueryClient()
  const queryKey = ordersListQueryKey()

  return useMutation({
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
    onError: (err, _, onMutateResult) =>
      queryClient.setQueryData(queryKey, onMutateResult?.previousData),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}

function TableCellActions({ item: order }: { item: Order }) {
  const destroyMutation = useOptimisticOrderDestroy(order)
  const onDestroy = () => destroyMutation.mutate({ path: { id: order.id } })

  const updateMutation = useOptimisticOrderUpdate(order)
  const [status, setStatus] = useState<OrderStatus>(order.status || "pending")
  const onStatusChange = React.useCallback(
    (value: OrderStatus) => {
      if (value === status) return
      if (updateMutation.isPending) return

      setStatus(value)
      const previous = status

      updateMutation.mutate(
        {
          path: { id: order.id },
          body: { status: value },
        },
        {
          onError: () => setStatus(previous),
        }
      )
    },
    [order.id, status, updateMutation]
  )

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="ghost" aria-label="Open actions">
            <EllipsisIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <ViewIcon />
              View details
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <RefreshCw />
                Change Status
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={status}
                    onValueChange={(value) =>
                      onStatusChange(value as OrderStatus)
                    }
                  >
                    {zOrderStatus.options.map((status) => {
                      return (
                        <DropdownMenuRadioItem
                          key={status}
                          value={status}
                          className={cn(
                            statusClasses[status],
                            "bg-transparent capitalize"
                          )}
                        >
                          {status}
                        </DropdownMenuRadioItem>
                      )
                    })}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive">
                <Trash2Icon />
                Delete order
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete order?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the order
            and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDestroy}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
