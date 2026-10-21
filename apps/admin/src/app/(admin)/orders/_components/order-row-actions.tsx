"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Order, OrderStatus } from "@workspace/api-client"
import {
  invoicesCreateMutation,
  invoicesListQueryKey,
  ordersRetrieveOptions,
} from "@workspace/api-client/query"
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
  CircleDashedIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  FileTextIcon,
  Trash2Icon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { useRowActions } from "@/context/row-actions-provider"
import { useOptimisticOrderUpdate } from "../_hooks/use-optimistic-order"
import { orderStatusClasses, orderStatusOptions } from "../_lib/order-status"

export function OrderRowActions({ item: order }: { item: Order }) {
  const { openAction } = useRowActions<Order>()

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

  const detailsHref = `/orders/${order.number}`
  const prefetchDetails = (open: boolean) => {
    if (!open) return
    router.prefetch(detailsHref)
    queryClient.prefetchQuery(
      ordersRetrieveOptions({ path: { number: order.number } })
    )
  }

  return (
    <DropdownMenu onOpenChange={prefetchDetails}>
      <DropdownMenuTrigger
        render={
          <Button size="icon-sm" variant="ghost" aria-label="Open actions" />
        }
      >
        <EllipsisVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href={detailsHref} />}>
            <EyeIcon />
            View details
          </DropdownMenuItem>
          {order.status === "paid" && (
            <DropdownMenuItem onClick={createInvoice}>
              <FileTextIcon />
              Create invoice
            </DropdownMenuItem>
          )}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CircleDashedIcon />
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
          <DropdownMenuItem
            variant="destructive"
            onClick={() => openAction("delete", order)}
          >
            <Trash2Icon />
            Delete order
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
