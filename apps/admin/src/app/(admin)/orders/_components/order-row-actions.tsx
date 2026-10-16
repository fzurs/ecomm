"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Order, OrderStatus } from "@workspace/api-client"
import {
  invoicesCreateMutation,
  invoicesListQueryKey,
} from "@workspace/api-client/query"
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
import { cn } from "@workspace/ui/lib/utils"
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
import {
  useOptimisticOrderDestroy,
  useOptimisticOrderUpdate,
} from "../_hooks/use-optimistic-order"
import { orderStatusClasses, orderStatusOptions } from "../_lib/order-status"

export function OrderRowActions({ item: order }: { item: Order }) {
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
                    {orderStatusOptions.map((opt) => (
                      <DropdownMenuRadioItem
                        key={opt.value}
                        value={opt.value}
                        className={cn(
                          orderStatusClasses[opt.value].badge,
                          orderStatusClasses[opt.value].focus,
                          "bg-transparent dark:bg-transparent"
                        )}
                      >
                        {opt.label}
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
