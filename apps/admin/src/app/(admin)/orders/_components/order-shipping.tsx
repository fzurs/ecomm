"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Order } from "@workspace/api-client"
import {
  ordersListQueryKey,
  ordersPartialUpdateMutation,
  ordersRetrieveQueryKey,
} from "@workspace/api-client/query"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { FieldGroup } from "@workspace/ui/components/field"
import { TruckIcon } from "lucide-react"
import { useState } from "react"
import { useAppForm } from "@/hooks/form"
import { useCan } from "@/hooks/use-auth"
import { provinces } from "@/lib/provinces"
import { applyServerErrors } from "@/lib/utils"

/** How the order gets to the customer, as they chose it at the store's
 * checkout, and the carrier and tracking number filled in by hand. */
export function OrderShipping({ order }: { order: Order }) {
  if (order.shipping_method === "pickup") {
    return (
      <div className="typeset">
        <p>Picked up at the store.</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="typeset">
        <p className="whitespace-pre-line">
          {order.shipping_address}
          {order.shipping_province && `\n${provinces[order.shipping_province]}`}
        </p>
        {(order.carrier || order.tracking_number) && (
          <p className="text-muted-foreground">
            {[order.carrier, order.tracking_number].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
      <TrackingDialog order={order} />
    </div>
  )
}

function TrackingDialog({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)
  const canChange = useCan("orders.change_order")
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...ordersPartialUpdateMutation(),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        ordersRetrieveQueryKey({ path: { number: order.number } }),
        updated
      )
      return queryClient.invalidateQueries({ queryKey: ordersListQueryKey() })
    },
  })

  const form = useAppForm({
    formId: `order-tracking-form-${order.id}`,
    defaultValues: {
      carrier: order.carrier ?? "",
      tracking_number: order.tracking_number ?? "",
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await mutateAsync({ path: { number: order.number }, body: value })
        setOpen(false)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })

  if (!canChange) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="w-fit" />}
      >
        <TruckIcon />
        {order.tracking_number ? "Edit tracking" : "Add tracking"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tracking</DialogTitle>
          <DialogDescription>
            The customer gets it by email when the order is marked as shipped.
          </DialogDescription>
        </DialogHeader>
        <form.AppForm>
          <form.Form>
            <FieldGroup>
              <form.AppField
                name="carrier"
                children={(field) => (
                  <field.TextField label="Carrier" placeholder="Andreani" />
                )}
              />
              <form.AppField
                name="tracking_number"
                children={(field) => (
                  <field.TextField label="Tracking number" />
                )}
              />
            </FieldGroup>
          </form.Form>
        </form.AppForm>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <form.AppForm>
            <form.SubmitButton>Save</form.SubmitButton>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
