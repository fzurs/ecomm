"use client"
import type {
  DocumentTypeEnum,
  Province,
  ShippingMethod,
  ShippingOptions,
  VatCondition,
} from "@workspace/api-client"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import Link from "next/link"
import * as React from "react"
import {
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
} from "@/components/form"
import { documentTypes, FINAL_CONSUMER, vatConditions } from "@/lib/fiscal"
import { formatPrice } from "@/lib/format"
import type { FormState } from "@/lib/form-state"
import { servedProvinces, shippingCost } from "@/lib/shipping"
import { placeOrder } from "../actions"

/**
 * Who buys, how it gets to them, and the order's summary with the shipping
 * they choose. The billing data is what the invoice needs: a final consumer
 * only their DNI; the others, the CUIT and their legal name.
 */
export function CheckoutForm({
  email,
  name,
  shipping,
  subtotal,
  signIn,
  items,
}: {
  /** A customer's, to start with. */
  email?: string
  name?: string
  shipping: ShippingOptions
  /** The cart's total, without shipping. */
  subtotal: number
  signIn: React.ReactNode
  items: React.ReactNode
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

  const provinceOptions = servedProvinces(shipping)
  const methods: { value: ShippingMethod; label: string }[] = [
    { value: "delivery", label: "Send it to me" },
    ...(shipping.pickup_address
      ? [{ value: "pickup" as const, label: "Pick it up at the store" }]
      : []),
  ]
  const [method, setMethod] = React.useState<ShippingMethod>(
    (values.shipping_method as ShippingMethod) || "delivery"
  )
  const [province, setProvince] = React.useState<Province | "">(
    (values.shipping_province as Province) ||
      provinceOptions.find((option) => option.value === "caba")?.value ||
      provinceOptions[0]?.value ||
      ""
  )
  const cost = shippingCost(shipping, method, province, subtotal)

  return (
    <form
      action={formAction}
      className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <FieldGroup>
        {signIn}
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
          <FieldGroup>
            {methods.length > 1 ? (
              <SelectField
                label="Delivery"
                name="shipping_method"
                items={methods}
                value={method}
                onValueChange={setMethod}
                error={errors.shipping_method}
              />
            ) : (
              <input type="hidden" name="shipping_method" value={method} />
            )}
            {method === "pickup" ? (
              <FieldDescription>
                Pick it up for free at {shipping.pickup_address}. We&apos;ll
                email you when it&apos;s ready.
              </FieldDescription>
            ) : provinceOptions.length ? (
              <>
                <SelectField
                  label="Province"
                  name="shipping_province"
                  items={provinceOptions}
                  value={province}
                  onValueChange={setProvince}
                  error={errors.shipping_province}
                />
                <TextareaField
                  label="Address"
                  name="shipping_address"
                  autoComplete="street-address"
                  required
                  rows={3}
                  defaultValue={values.shipping_address}
                  description="Street and number, apartment, city and postal code."
                  error={errors.shipping_address}
                />
              </>
            ) : (
              <FieldError>We don&apos;t ship orders right now.</FieldError>
            )}
          </FieldGroup>
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
        <SubmitButton size="lg" disabled={cost === null}>
          Continue to payment
        </SubmitButton>
      </FieldGroup>
      <Card className="lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle>Your order</CardTitle>
        </CardHeader>
        <CardContent>{items}</CardContent>
        <CardFooter className="flex flex-col items-stretch gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {method === "pickup" ? "Pickup" : "Shipping"}
            </span>
            <span className="tabular-nums">
              {cost === null ? "—" : cost === 0 ? "Free" : formatPrice(cost)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">
              {formatPrice(subtotal + (cost ?? 0))}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            You&apos;ll pay with Mercado Pago: cards, your Mercado Pago balance
            or cash.
          </p>
          <Link
            href="/cart"
            className="mt-2 text-sm underline-offset-4 hover:underline"
          >
            Edit cart
          </Link>
        </CardFooter>
      </Card>
    </form>
  )
}
