import { zDebitNoteLine } from "@workspace/api-client/zod"
import z from "zod"

// The generated schema describes the API contract; the form adds its own UX
// rules on top: a description and a price above zero.
export const debitNoteLineSchema = zDebitNoteLine.extend({
  description: z.string().trim().min(1, "Description is required").max(255),
  quantity: z.int("Quantity is required").min(1),
  unit_price: zDebitNoteLine.shape.unit_price.refine(
    (price) => Number(price) > 0,
    "The price must be greater than zero."
  ),
})

export const debitNoteFormSchema = z.object({
  lines: z.array(debitNoteLineSchema).min(1, "Add at least one line."),
})

export type DebitNoteFormValues = z.infer<typeof debitNoteFormSchema>
export type DebitNoteLineValues = DebitNoteFormValues["lines"][number]

// IVA at 21% (VatRate 5), the products' default.
export const emptyDebitNoteLine: DebitNoteLineValues = {
  description: "",
  quantity: 1,
  unit_price: "",
  vat_rate: 5,
}
