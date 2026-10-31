"use client"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { FieldError, FieldGroup } from "@workspace/ui/components/field"
import { CircleCheckIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { SubmitButton, TextareaField, TextField } from "@/components/form"
import { requestRevocation, type RevocationState } from "../actions"

/** The order's number and email prove it's theirs; the reason is optional. */
export function RevocationForm() {
  const [state, formAction] = React.useActionState<RevocationState, FormData>(
    requestRevocation,
    {}
  )
  // From the order's page: /revocation?order=ORD-000123
  const order = useSearchParams().get("order") ?? undefined
  const values = state.values ?? {}
  const errors = state.fieldErrors ?? {}

  if (state.code) {
    return (
      <Alert>
        <CircleCheckIcon />
        <AlertTitle>Your request&apos;s code is {state.code}</AlertTitle>
        <AlertDescription>
          We also sent it to {values.email}. We&apos;ll write to you once we
          review it; if the order was already shipped, we&apos;ll tell you how
          to send it back.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form action={formAction}>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Order number"
            name="order_number"
            required
            placeholder="ORD-000123"
            defaultValue={values.order_number ?? order}
            error={errors.order_number}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={values.email}
            description="The one you placed the order with."
            error={errors.email}
          />
        </div>
        <TextareaField
          label="Reason (optional)"
          name="reason"
          rows={3}
          defaultValue={values.reason}
          error={errors.reason}
        />
        <FieldError>{state.formError}</FieldError>
        <SubmitButton size="lg" className="w-fit">
          Revoke the purchase
        </SubmitButton>
      </FieldGroup>
    </form>
  )
}
