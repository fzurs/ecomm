import { PaymentStatus } from "@workspace/api-client"
import { StatusDefinition } from "@/components/status"

// Keyed by the generated enum: Mercado Pago's statuses of a payment, plus
// `created` (the link, before any payment).
export const paymentStatuses: Record<PaymentStatus, StatusDefinition> = {
  created: { label: "Link created", color: "gray" },
  pending: { label: "Pending", color: "amber" },
  in_process: { label: "In process", color: "amber" },
  authorized: { label: "Authorized", color: "blue" },
  in_mediation: { label: "In mediation", color: "orange" },
  approved: { label: "Approved", color: "green" },
  rejected: { label: "Rejected", color: "red" },
  cancelled: { label: "Cancelled", color: "gray" },
  refunded: { label: "Refunded", color: "violet" },
  charged_back: { label: "Charged back", color: "red" },
}
