"use client"
import { useAppForm, withForm } from "@/hooks/form"
import { formOptions, useSelector } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InvoiceDetail } from "@workspace/api-client"
import { invoicesCreditNoteMutation } from "@workspace/api-client/query"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import Link from "next/link"
import { applyServerErrors, formatPrice } from "@/lib/utils"
import { toastEmission } from "../_hooks/use-invoice-mutations"
import {
  creditNoteFormSchema,
  CreditNoteFormValues,
  toCreditNoteFormValues,
} from "../_lib/credit-note-schema"
import { invalidateInvoices } from "../_lib/invalidate-invoices"
import { InvoiceLinesTable } from "./invoice-lines-table"

const defaultValues: CreditNoteFormValues = { lines: [] }

const creditNoteFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: creditNoteFormSchema },
})

export function useCreditNoteForm({
  invoice,
  onSuccess,
}: {
  invoice: InvoiceDetail
  onSuccess?: (note: InvoiceDetail) => void
}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...invoicesCreditNoteMutation(),
    onSettled: () => invalidateInvoices(queryClient),
  })

  return useAppForm({
    ...creditNoteFormOpts,
    formId: `credit-note-form-${invoice.id}`,
    defaultValues: toCreditNoteFormValues(invoice),
    onSubmit: async ({ value, formApi }) => {
      try {
        const note = await mutateAsync({
          path: { id: invoice.id },
          body: { lines: value.lines.filter((line) => line.quantity > 0) },
        })
        toastEmission(note)
        onSuccess?.(note)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}

export const CreditNoteForm = withForm({
  ...creditNoteFormOpts,
  props: {} as { invoice: InvoiceDetail },
  render: function Render({ form, invoice }) {
    const values = useSelector(form.store, (state) => state.values.lines)
    const total = invoice.lines.reduce(
      (sum, line, index) =>
        sum + Number(line.unit_price) * (values[index]?.quantity ?? 0),
      0
    )

    return (
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            <form.Field
              name="lines"
              mode="array"
              children={(field) => {
                const isInvalid = !field.state.meta.isValid
                return (
                  <FieldSet>
                    <FieldLegend>Lines to credit</FieldLegend>
                    <FieldDescription>
                      Everything left to credit is selected: lower the
                      quantities for a partial credit note.
                    </FieldDescription>
                    <InvoiceLinesTable
                      lines={invoice.lines}
                      renderQuantity={(line, index) => {
                        const remaining = line.quantity - line.credited_quantity
                        return (
                          <form.Field
                            name={`lines[${index}].quantity`}
                            children={(subField) => (
                              <div className="flex items-center justify-center gap-2">
                                <Input
                                  type="number"
                                  min={0}
                                  max={remaining}
                                  value={subField.state.value}
                                  disabled={remaining === 0}
                                  onBlur={subField.handleBlur}
                                  onChange={(e) => {
                                    const value = Number(e.target.value)
                                    subField.handleChange(
                                      Math.min(Math.max(value, 0), remaining)
                                    )
                                  }}
                                  aria-label={`Quantity of ${line.description} to credit`}
                                  className="max-w-20"
                                />
                                <span className="text-muted-foreground">
                                  / {remaining}
                                </span>
                              </div>
                            )}
                          />
                        )
                      }}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldSet>
                )
              }}
            />
            <p className="text-right font-semibold">
              Credit note total: {formatPrice(total)}
            </p>
            <Field orientation="horizontal" className="justify-end">
              <Link
                href={`/invoices/${invoice.id}`}
                className={buttonVariants({ variant: "outline" })}
              >
                Cancel
              </Link>
              {/* Enabled untouched: the defaults are already a full credit note. */}
              <form.Subscribe
                selector={(state) => state.isSubmitting}
                children={(isSubmitting) => (
                  <form.SubmitButton disabled={isSubmitting}>
                    {isSubmitting ? "Emitting..." : "Emit credit note"}
                  </form.SubmitButton>
                )}
              />
            </Field>
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    )
  },
})
