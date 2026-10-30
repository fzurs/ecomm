import type { Flow } from "@workspace/api-client/allauth"

/**
 * The flows allauth answers with a 401: e.g. `mfa_authenticate` pending after
 * the password, or `reauthenticate` before turning 2FA on or off.
 */
function flowsOf(error: unknown): Flow[] {
  const response = (
    error as {
      response?: { status?: number; data?: { data?: { flows?: Flow[] } } }
    } | null
  )?.response
  if (response?.status !== 401) return []
  return response.data?.data?.flows ?? []
}

/** The login waits for a second factor (allauth's `mfa_authenticate`). */
export function needsSecondFactor(error: unknown) {
  return flowsOf(error).some(
    (flow) => flow.id === "mfa_authenticate" && flow.is_pending
  )
}

/** allauth wants the password again before a sensitive change (2FA on/off). */
export function needsReauthentication(error: unknown) {
  return flowsOf(error).some((flow) => flow.id === "reauthenticate")
}
