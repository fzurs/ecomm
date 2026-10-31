"use client"
import type { DocumentTypeEnum, VatCondition } from "@workspace/api-client"
import {
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import * as React from "react"
import {
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
} from "@/components/form"
import { documentTypes, FINAL_CONSUMER, vatConditions } from "@/lib/fiscal"
import type { FormState } from "@/lib/form-state"
import { placeOrder } from "../actions"

/**
 * Who buys and where it goes. The billing data is what the invoice needs: a
 * final consumer only their DNI; the others, the CUIT and their legal name.
 */
export function CheckoutForm({
  email,
  name,
}: {
  /** A customer's, to start with. */
  email?: string
  name?: string
}) {
  const [state, formAction] = React.useActionState<FormState, FormData>(
    placeOrder,
    {}
  )
  const values = state.values ?? {}
  const errors = state.fieldErrors ?? {}

  const [vatCondition, setVatCondition] = React.useState<VatCondition>(
    values.vat_condition
      ? (Number(values.vat_condition) as VatCondition)
      : FINAL_CONSUMER
  )
  const [documentType, setDocumentType] = React.useState<DocumentTypeEnum>(
    values.document_type
      ? (Number(values.document_type) as DocumentTypeEnum)
      : 96
  )
  const finalConsumer = vatCondition === FINAL_CONSUMER

  return (
    <form action={formAction}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Contact</FieldLegend>
          <FieldGroup>
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={values.email ?? email}
              description="We'll send the order here."
              error={errors.email}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Full name"
                name="name"
                autoComplete="name"
                required
                defaultValue={values.name ?? name}
                error={errors.name}
              />
              <TextField
                label="Phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={values.phone}
                error={errors.phone}
              />
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Shipping</FieldLegend>
          <TextareaField
            label="Address"
            name="shipping_address"
            autoComplete="street-address"
            required
            rows={3}
            defaultValue={values.shipping_address}
            description="Street and number, apartment, city, province and postal code."
            error={errors.shipping_address}
          />
        </FieldSet>

        <FieldSet>
          <FieldLegend>Billing</FieldLegend>
          <FieldGroup>
            <SelectField
              label="VAT condition"
              name="vat_condition"
              items={vatConditions}
              value={vatCondition}
              onValueChange={(value) => {
                setVatCondition(value)
                // Everyone but a final consumer is invoiced to their CUIT.
                if (value !== FINAL_CONSUMER) setDocumentType(80)
              }}
              error={errors.vat_condition}
            />
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <SelectField
                label="Document"
                name="document_type"
                items={documentTypes}
                value={documentType}
                onValueChange={setDocumentType}
                error={errors.document_type}
              />
              <TextField
                label="Number"
                name="document_number"
                inputMode="numeric"
                required={!finalConsumer}
                defaultValue={values.document_number}
                error={errors.document_number}
              />
            </div>
            {!finalConsumer && (
              <TextField
                label="Legal name"
                name="legal_name"
                autoComplete="organization"
                defaultValue={values.legal_name}
                description="As it goes on the invoice. Empty means your full name."
                error={errors.legal_name}
              />
            )}
          </FieldGroup>
        </FieldSet>

        <FieldError>{state.formError}</FieldError>
        <SubmitButton size="lg">Continue to payment</SubmitButton>
      </FieldGroup>
    </form>
  )
}
