import { InvoiceStatus } from "@workspace/api-client"
import { zInvoiceStatus } from "@workspace/api-client/zod"
import { StatusDefinition, statusOptions } from "@/components/status"

// Keyed by the generated enum: a status added in the API fails the typecheck
// until it gets its label and color here.
export const invoiceStatuses: Record<InvoiceStatus, StatusDefinition> = {
  pending: { label: "Pending", color: "amber" },
  authorized: { label: "Authorized", color: "green" },
  rejected: { label: "Rejected", color: "red" },
  // The connection to ARCA dropped: it must be verified, never emitted again.
  unverified: { label: "Unverified", color: "orange" },
}

// In the API's order, for menus and filters.
export const invoiceStatusOptions = statusOptions(
  zInvoiceStatus.options,
  invoiceStatuses
)
