import { InvoiceDetail } from "@workspace/api-client"
import { zCreditNoteLine } from "@workspace/api-client/zod"
import z from "zod"

// One row per invoice line, with the quantity to credit: 0 leaves it out. The
// API checks the quantities against what is left to credit.
export const creditNoteFormSchema = z.object({
  lines: z
    .array(zCreditNoteLine.extend({ quantity: z.int().min(0) }))
    .refine((lines) => lines.some((line) => line.quantity > 0), {
      message: "Credit at least one unit.",
    }),
})

export type CreditNoteFormValues = z.infer<typeof creditNoteFormSchema>

/** Everything left to credit: a full credit note unless it is changed. */
export function toCreditNoteFormValues(
  invoice: InvoiceDetail
): CreditNoteFormValues {
  return {
    lines: invoice.lines.map((line) => ({
      line: line.id,
      quantity: line.quantity - line.credited_quantity,
    })),
  }
}
