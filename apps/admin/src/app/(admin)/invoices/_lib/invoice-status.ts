import { InvoiceStatus } from "@workspace/api-client"

// Keyed by the generated enum: a status added in the API fails the typecheck
// until it gets its label and colors here.
export const invoiceStatuses: Record<
  InvoiceStatus,
  { label: string; badge: string }
> = {
  pending: {
    label: "Pending",
    badge: "bg-yellow-500/15 text-yellow-900 dark:text-yellow-400",
  },
  success: {
    label: "Success",
    badge: "bg-green-500/15 text-green-900 dark:text-green-400",
  },
  error: {
    label: "Error",
    badge: "bg-red-500/15 text-red-900 dark:text-red-400",
  },
}
