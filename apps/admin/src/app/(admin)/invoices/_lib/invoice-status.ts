import { InvoiceStatus } from "@workspace/api-client"
import { StatusDefinition } from "@/components/status"

// Keyed by the generated enum: a status added in the API fails the typecheck
// until it gets its label and color here.
export const invoiceStatuses: Record<InvoiceStatus, StatusDefinition> = {
  pending: { label: "Pending", color: "amber" },
  success: { label: "Success", color: "green" },
  error: { label: "Error", color: "red" },
}
