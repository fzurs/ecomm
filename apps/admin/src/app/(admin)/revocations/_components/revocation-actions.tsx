"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { RevocationRequest } from "@workspace/api-client"
import {
  revocationsApproveMutation,
  revocationsRejectMutation,
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
import { CheckIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import z from "zod"
import { useAppForm } from "@/hooks/form"
import { applyServerErrors } from "@/lib/utils"
import { invalidateRevocations } from "../_lib/invalidate-revocations"

/** Approve gives the money back and credits the invoice; reject tells the
 * customer why. Both are final. */
export function RevocationActions({
  revocation,
  onResolved,
}: {
  revocation: RevocationRequest
  onResolved: (revocation: RevocationRequest) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <ApproveDialog revocation={revocation} onResolved={onResolved} />
      <RejectDialog revocation={revocation} onResolved={onResolved} />
    </div>
  )
}

function ApproveDialog({
  revocation,
  onResolved,
}: {
  revocation: RevocationRequest
  onResolved: (revocation: RevocationRequest) => void
}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const shipped = ["shipped", "delivered"].includes(
    revocation.order.status ?? ""
  )

  const { mutateAsync } = useMutation({
    ...revocationsApproveMutation(),
    onSuccess: () => invalidateRevocations(queryClient),
  })

  const form = useAppForm({
    formId: `approve-revocation-${revocation.id}`,
    // A shipped order without its goods back: the API answers why (409).
    defaultValues: { goods_returned: false, note: "" },
    onSubmit: async ({ value, formApi }) => {
      try {
        const updated = await mutateAsync({
          path: { code: revocation.code },
          body: value,
        })
        toast.success(`${revocation.code} approved.`)
        setOpen(false)
        onResolved(updated)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <CheckIcon />
        Approve
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve {revocation.code}?</DialogTitle>
          <DialogDescription>
            The payment goes back with Mercado Pago (or by hand, for an order
            without one), the invoice is credited and the order cancelled. It
            can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <form.AppForm>
          <form.Form>
            <FieldGroup>
              {shipped && (
                <form.AppField
                  name="goods_returned"
                  children={(field) => (
                    <field.CheckboxField label="The order was shipped: its goods are back" />
                  )}
                />
              )}
              <form.AppField
                name="note"
                children={(field) => (
                  <field.TextareaField
                    label="Note for the customer (optional)"
                    rows={3}
                  />
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
            <form.SubmitButton>Approve and refund</form.SubmitButton>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RejectDialog({
  revocation,
  onResolved,
}: {
  revocation: RevocationRequest
  onResolved: (revocation: RevocationRequest) => void
}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...revocationsRejectMutation(),
    onSuccess: () => invalidateRevocations(queryClient),
  })

  const form = useAppForm({
    formId: `reject-revocation-${revocation.id}`,
    defaultValues: { note: "" },
    validators: {
      onSubmit: z.object({
        note: z.string().trim().min(1, "Tell the customer why").max(2000),
      }),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const updated = await mutateAsync({
          path: { code: revocation.code },
          body: value,
        })
        toast.success(`${revocation.code} rejected.`)
        setOpen(false)
        onResolved(updated)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <XIcon />
        Reject
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject {revocation.code}?</DialogTitle>
          <DialogDescription>
            Only when the law doesn&apos;t cover it, e.g. past the 10 days. The
            customer gets the reason by email.
          </DialogDescription>
        </DialogHeader>
        <form.AppForm>
          <form.Form>
            <form.AppField
              name="note"
              children={(field) => (
                <field.TextareaField label="Reason" rows={3} />
              )}
            />
          </form.Form>
        </form.AppForm>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <form.AppForm>
            <form.SubmitButton variant="destructive">Reject</form.SubmitButton>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
