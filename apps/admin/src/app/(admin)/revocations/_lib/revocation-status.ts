import { RevocationStatus } from "@workspace/api-client"
import { zRevocationStatus } from "@workspace/api-client/zod"
import { StatusDefinition, statusOptions } from "@/components/status"

// Keyed by the generated enum: a status added in the API fails the typecheck
// until it gets its label and color here.
export const revocationStatuses: Record<RevocationStatus, StatusDefinition> = {
  requested: { label: "Requested", color: "amber" },
  approved: { label: "Approved", color: "green" },
  rejected: { label: "Rejected", color: "red" },
}

export const revocationStatusOptions = statusOptions(
  zRevocationStatus.options,
  revocationStatuses
)
