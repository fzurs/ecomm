import { snakeCaseToTitle } from "@/lib/utils"
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
import {
  CircleCheckIcon,
  CircleXIcon,
  ContainerIcon,
  EllipsisVerticalIcon,
  LoaderIcon,
  Package,
  SquarePenIcon,
  Trash2Icon,
  TruckIcon,
  ViewIcon,
} from "lucide-react"
import React, { useState } from "react"

export function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case "pending":
      return <LoaderIcon className="text-muted-foreground" />
    case "paid":
      return <CircleCheckIcon className="text-green-600" />
    case "shipped":
      return <ContainerIcon className="text-blue-600" />
    case "delivered":
      return <TruckIcon className="text-yellow-600" />
    case "cancelled":
      return <CircleXIcon className="text-red-500" />
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
    cell: ({ row }) => <TableCellActions item={row.original} />,
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

function TableCellActions({ item: order }: { item: Order }) {
  const onDestroy = useOptimisticOrderDestroy(order)

  const [status, setStatus] = useState<string>(order.status ?? "")
  const updateMutation = useOptimisticOrderUpdate(order)
  const onStatusChange = (value: string) => {
    setStatus(value)
    updateMutation.mutate({
      path: { id: order.id },
      body: { status: value as OrderStatus },
    })
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="ghost" aria-label="Open actions">
            <EllipsisVerticalIcon />
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
                <SquarePenIcon />
                Change status
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={status}
                    onValueChange={onStatusChange}
                  >
                    {statusOptions.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                        className="justity-between"
                      >
                        {option.icon}
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
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
    onError: (err, _, onMutateResult) => {
      queryClient.setQueryData(queryKey, onMutateResult?.previousData)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}
