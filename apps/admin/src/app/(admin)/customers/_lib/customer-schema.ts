import { Customer } from "@workspace/api-client"
import { zCustomerWritable } from "@workspace/api-client/zod"
import z from "zod"

// The generated schema describes the API contract; the form adds its own UX
// rules on top: a required name, and empty optional fields as "".
export const customerFormSchema = zCustomerWritable
  .pick({ name: true, email: true, phone: true, document_number: true })
  .extend({
    name: z.string().trim().min(1, "Name is required").max(255),
    email: z.email().max(254).or(z.literal("")),
    phone: z.string().max(20),
    document_number: z.string().max(20),
  })

export type CustomerFormValues = z.infer<typeof customerFormSchema>

export function toCustomerFormValues(customer: Customer): CustomerFormValues {
  return {
    name: customer.name,
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    document_number: customer.document_number ?? "",
  }
}
