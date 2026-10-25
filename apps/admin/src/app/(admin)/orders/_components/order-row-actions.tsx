"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Order } from "@workspace/api-client"
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
import { useRouter } from "next/navigation"
import { useRowActions } from "@/context/row-actions-provider"
import { useOptimisticOrderStatusUpdate } from "../_hooks/use-optimistic-order"
import { OrderStatusRadioGroup } from "./order-status-radio-group"

export function OrderRowActions({ item: order }: { item: Order }) {
  const { openAction } = useRowActions<Order>()

  const { status, setStatus } = useOptimisticOrderStatusUpdate(order)

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
          {order.status === "paid" && (
            <DropdownMenuItem onClick={createInvoice}>
              <FileTextIcon />
              Create invoice
            </DropdownMenuItem>
          )}
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
                />
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
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
