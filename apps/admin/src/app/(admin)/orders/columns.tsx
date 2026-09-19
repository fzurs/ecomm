import { capitalize, formatPrice } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import {
  Customer,
  Order,
  OrderItem,
  OrderStatus,
  PaginatedOrderList,
} from "@workspace/api-client"
import {
  invoicesCreateMutation,
  invoicesListQueryKey,
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
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
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"
import { format } from "date-fns"
import {
  EllipsisIcon,
  FileTextIcon,
  RefreshCw,
  Trash2Icon,
  ViewIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

export const statusClasses: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-900 dark:text-yellow-400",
  paid: "bg-green-500/15 text-green-900 dark:text-green-400",
  shipped: "bg-blue-500/15 text-blue-900 dark:text-blue-400",
  delivered: "bg-emerald-500/15 text-emerald-900 dark:text-emerald-400",
  cancelled: "bg-red-500/15 text-red-900 dark:text-red-400",
}

export const statusOptions = zOrderStatus.options.map((status) => ({
  label: capitalize(status.replaceAll("_", " ")),
  value: status,
}))

export const columns = [
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
    meta: { variant: "multi-select", options: statusOptions },
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
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="font-normal">
              {orderItems.length} item{orderItems.length > 1 && "s"}
            </Button>
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
        <Item size="sm" className="p-0 flex-nowrap">
          <ItemMedia>
            <CustomerAvatar customer={customer} size="sm" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{customer.name}</ItemTitle>
          </ItemContent>
        </Item>
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
    cell: ({ row }) => <TableCellActions item={row.original} />,
    enableHiding: false,
  },
] as const satisfies ColumnDef<Order>[]

export function OrderStatusBadge({
  status,
  className,
  ...props
}: React.ComponentProps<typeof Badge> & { status: OrderStatus }) {
  const statusOption = statusOptions.find((option) => option.value === status)
  if (!statusOption) return null
  return (
    <Badge
      className={cn("rounded-md py-1", statusClasses[status], className)}
      {...props}
    >
      {statusOption.label}
    </Badge>
  )
}

export function CustomerAvatar({
  customer,
  ...props
}: React.ComponentProps<typeof Avatar> & { customer: Customer }) {
  return (
    <Avatar {...props}>
      {customer.image && <AvatarImage src={customer.image} />}
      <AvatarFallback />
    </Avatar>
  )
}

export function OrderItemsTable({
  orderItems,
  renderActions,
  renderQuantity,
  showTotal = false,
  variant = "default",
  total,
}: {
  orderItems: OrderItem[]
  renderActions?: (index: number) => React.ReactNode
  renderQuantity?: (index: number) => React.ReactNode
  showTotal?: boolean
  variant?: "default" | "compact"
  total?: number
}) {
  return (
    <Table className={cn(variant === "compact" && "[&_th]:h-6")}>
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
              <TableCell className="text-center">
                {product.price && formatPrice(product.price)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatPrice(subtotal)}
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
      {showTotal && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">
              {total && formatPrice(total)}
            </TableCell>
            {renderActions && <TableCell />}
          </TableRow>
        </TableFooter>
      )}
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
  const onDestroy = () =>
    destroyMutation.mutate({ path: { number: order.number } })

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
          path: { number: order.number },
          body: { status: value },
        },
        {
          onError: () => setStatus(previous),
        }
      )
    },
    [order.number, status, updateMutation]
  )

  const queryClient = useQueryClient()
  const router = useRouter()
  const createInvoiceMutation = useMutation({
    ...invoicesCreateMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoicesListQueryKey() })
      router.push("/invoices")
    },
  })
  const createInvoice = () =>
    createInvoiceMutation.mutate({ body: { order: order.id } })

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
            <DropdownMenuItem asChild>
              <Link href={`/orders/${order.number}`}>
                <ViewIcon />
                View details
              </Link>
            </DropdownMenuItem>
            {order.status === "paid" && (
              <DropdownMenuItem onClick={createInvoice}>
                <FileTextIcon />
                Create invoice
              </DropdownMenuItem>
            )}
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
                    {statusOptions.map((opt) => {
                      return (
                        <DropdownMenuRadioItem
                          key={opt.value}
                          value={opt.value}
                          className={cn(
                            statusClasses[opt.value],
                            "bg-transparent"
                          )}
                        >
                          {opt.label}
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
