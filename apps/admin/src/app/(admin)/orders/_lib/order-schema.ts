import { zOrderCreateWritable, zOrderStatus } from "@workspace/api-client/zod"
import z from "zod"

// The generated schema describes the API contract; the form adds its own UX
// rules on top: a selected customer (-1 means none), at least one item, and a
// status it can start in (the API rejects a cancelled one).
export const orderFormSchema = zOrderCreateWritable
  .pick({ customer: true, status: true, items: true })
  .extend({
    customer: z.int().positive("Please select a customer."),
    status: zOrderStatus.exclude(["cancelled"]),
    items: zOrderCreateWritable.shape.items.min(
      1,
      "Please add at least one item to the order."
    ),
  })

export type OrderFormValues = z.infer<typeof orderFormSchema>
