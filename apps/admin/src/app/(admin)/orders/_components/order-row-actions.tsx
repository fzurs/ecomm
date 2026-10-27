"use client"
import { useQueryClient } from "@tanstack/react-query"
import { Order } from "@workspace/api-client"
import { ordersRetrieveOptions } from "@workspace/api-client/query"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  CircleDashedIcon,
  EllipsisVerticalIcon,
  FileTextIcon,
  PanelRightIcon,
  Trash2Icon,
} from "lucide-react"
import Link from "next/link"
import { useRowActions } from "@/context/row-actions-provider"
import { useOptimisticOrderStatusUpdate } from "../_hooks/use-optimistic-order"
import {
  canInvoice,
  invoiceActionLabel,
  isInvoiced,
} from "../_lib/order-invoice-status"
import { OrderStatusRadioGroup } from "./order-status-radio-group"

export function OrderRowActions({ item: order }: { item: Order }) {
  const { openAction } = useRowActions<Order>()

  const { status, setStatus } = useOptimisticOrderStatusUpdate(order)

  const queryClient = useQueryClient()

  // Warms the detail query the view drawer reads.
  const prefetchDetails = (open: boolean) => {
    if (!open) return
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
          <DropdownMenuItem onClick={() => openAction("view", order)}>
            <PanelRightIcon />
            View details
          </DropdownMenuItem>
          <OrderInvoiceMenuItem order={order} />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CircleDashedIcon />
              Change status
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <OrderStatusRadioGroup
                  value={status}
                  onValueChange={setStatus}
                  locks={order.status_locks}
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* The reason under the label, as the status locks: a disabled
              item gets no hover for a tooltip. */}
          <DropdownMenuItem
            variant="destructive"
            disabled={!!order.delete_lock}
            onClick={() => openAction("delete", order)}
          >
            <Trash2Icon />
            <span className="flex flex-col">
              Delete
              {order.delete_lock && (
                <span className="max-w-56 text-xs text-muted-foreground">
                  {order.delete_lock}
                </span>
              )}
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Always there, so invoicing can be found: it opens the invoice once there is
 * one, invoices the order when it can, and else says why it can't.
 */
function OrderInvoiceMenuItem({ order }: { order: Order }) {
  const { openAction } = useRowActions<Order>()

  if (isInvoiced(order) && order.invoice_id) {
    return (
      <DropdownMenuItem
        render={<Link href={`/invoices/${order.invoice_id}`} />}
      >
        <FileTextIcon />
        View invoice
      </DropdownMenuItem>
    )
  }
  if (canInvoice(order)) {
    return (
      <DropdownMenuItem onClick={() => openAction("invoice", order)}>
        <FileTextIcon />
        {invoiceActionLabel(order)}
      </DropdownMenuItem>
    )
  }
  // A cancelled order won't be invoiced: nothing to point to.
  if (order.status === "cancelled") return null
  // The reason under the label, as the status locks.
  return (
    <DropdownMenuItem disabled>
      <FileTextIcon />
      <span className="flex flex-col">
        Create invoice
        <span className="max-w-56 text-xs text-muted-foreground">
          Only paid orders are invoiced.
        </span>
      </span>
    </DropdownMenuItem>
  )
}
