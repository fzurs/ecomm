"use client"
import { useAppForm, withForm } from "@/hooks/form"
import { formOptions, useSelector } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InvoiceDetail } from "@workspace/api-client"
import { invoicesDebitNoteMutation } from "@workspace/api-client/query"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@workspace/ui/components/field"
import { PlusIcon, XIcon } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { vatRateOptions } from "@/lib/fiscal"
import { applyServerErrors, formatPrice } from "@/lib/utils"
import { toastEmission } from "../_hooks/use-invoice-mutations"
import {
  debitNoteFormSchema,
  DebitNoteFormValues,
  emptyDebitNoteLine,
} from "../_lib/debit-note-schema"
import { invalidateInvoices } from "../_lib/invalidate-invoices"

const defaultValues: DebitNoteFormValues = { lines: [emptyDebitNoteLine] }

const debitNoteFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: debitNoteFormSchema },
})

export function useDebitNoteForm({
  invoice,
  onSuccess,
}: {
  invoice: InvoiceDetail
  onSuccess?: (note: InvoiceDetail) => void
}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...invoicesDebitNoteMutation(),
    onSettled: () => invalidateInvoices(queryClient),
  })

  return useAppForm({
    ...debitNoteFormOpts,
    formId: `debit-note-form-${invoice.id}`,
    onSubmit: async ({ value, formApi }) => {
      try {
        const note = await mutateAsync({
          path: { id: invoice.id },
          body: value,
        })
        toastEmission(note)
        onSuccess?.(note)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}

export const DebitNoteForm = withForm({
  ...debitNoteFormOpts,
  props: {} as { invoice: InvoiceDetail },
  render: function Render({ form, invoice }) {
    const lines = useSelector(form.store, (state) => state.values.lines)
    const total = lines.reduce(
      (sum, line) =>
        sum + (Number(line.unit_price) || 0) * (line.quantity ?? 0),
      0
    )

    return (
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            <form.Field
              name="lines"
              mode="array"
              children={(field) => (
                <FieldSet>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <FieldLegend>Lines</FieldLegend>
                      <FieldDescription>
                        What is charged on top of the invoice (interest,
                        shipping, a price difference...). Prices include IVA.
                      </FieldDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => field.pushValue(emptyDebitNoteLine)}
                    >
                      <PlusIcon />
                      Add line
                    </Button>
                  </div>
                  {field.state.value.map((_, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <FieldSeparator className="@2xl/main:hidden" />
                      )}
                      <div className="grid items-start gap-4 @2xl/main:grid-cols-[1fr_6rem_9rem_9rem_auto]">
                        <form.AppField
                          name={`lines[${index}].description`}
                          children={(subField) => (
                            <subField.TextField label="Description" />
                          )}
                        />
                        <form.AppField
                          name={`lines[${index}].quantity`}
                          children={(subField) => (
                            <subField.NumberField label="Quantity" min={1} />
                          )}
                        />
                        <form.AppField
                          name={`lines[${index}].unit_price`}
                          children={(subField) => (
                            <subField.TextField
                              label="Unit price"
                              inputMode="decimal"
                              placeholder="0.00"
                            />
                          )}
                        />
                        <form.AppField
                          name={`lines[${index}].vat_rate`}
                          children={(subField) => (
                            <subField.SelectField
                              label="IVA"
                              options={vatRateOptions}
                            />
                          )}
                        />
                        {/* The invisible label and the gap match a Field's, so the
                      button lines up with the inputs. */}
                        <div className="flex flex-col items-end gap-3 @2xl/main:items-start">
                          <FieldLabel
                            aria-hidden
                            className="invisible hidden @2xl/main:flex"
                          >
                            Remove
                          </FieldLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="@2xl/main:size-9 @2xl/main:px-0"
                            disabled={field.state.value.length === 1}
                            onClick={() => field.removeValue(index)}
                          >
                            <XIcon />
                            <span className="@2xl/main:sr-only">
                              Remove line
                            </span>
                          </Button>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                  {!field.state.meta.isValid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </FieldSet>
              )}
            />
            <p className="text-right font-semibold">
              Debit note total: {formatPrice(total)}
            </p>
            <Field orientation="horizontal" className="justify-end">
              <Link
                href={`/invoices/${invoice.id}`}
                className={buttonVariants({ variant: "outline" })}
              >
                Cancel
              </Link>
              <form.Subscribe
                selector={(state) => state.isSubmitting}
                children={(isSubmitting) => (
                  <form.SubmitButton>
                    {isSubmitting ? "Emitting..." : "Emit debit note"}
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
