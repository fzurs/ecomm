import { Customer } from "@workspace/api-client"
import {
  zCustomerWritable,
  zDocumentTypeEnum,
  zVatCondition,
} from "@workspace/api-client/zod"
import z from "zod"

// The generated schema describes the API contract; the form adds its own UX
// rules on top: a required name, and empty optional fields as "". The API
// checks the CUIT (check digit, required for Factura A customers).
export const customerFormSchema = zCustomerWritable
  .pick({
    name: true,
    email: true,
    phone: true,
    document_type: true,
    document_number: true,
    vat_condition: true,
    legal_name: true,
    address: true,
  })
  .extend({
    name: z.string().trim().min(1, "Name is required").max(255),
    email: z.email().max(254).or(z.literal("")),
    phone: z.string().max(20),
    document_type: zDocumentTypeEnum,
    document_number: z.string().max(20),
    vat_condition: zVatCondition,
    legal_name: z.string().max(255),
    address: z.string().max(255),
  })

export type CustomerFormValues = z.infer<typeof customerFormSchema>

export function toCustomerFormValues(customer: Customer): CustomerFormValues {
  return {
    name: customer.name,
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    document_type: customer.document_type ?? 80,
    document_number: customer.document_number ?? "",
    vat_condition: customer.vat_condition ?? 5,
    legal_name: customer.legal_name ?? "",
    address: customer.address ?? "",
  }
}
