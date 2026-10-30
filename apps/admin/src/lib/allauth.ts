import type { AuthenticatorType, Flow } from "@workspace/api-client/allauth"
import { getServerErrorMessage } from "@/lib/utils"
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser"

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

/**
 * The second factors a pending login accepts (allauth's `mfa_authenticate`):
 * the account's own, e.g. `["webauthn", "totp", "recovery_codes"]`. Null if
 * the login isn't waiting for one.
 */
export function pendingSecondFactor(
  error: unknown
): AuthenticatorType[] | null {
  const flow = flowsOf(error).find(
    (flow) => flow.id === "mfa_authenticate" && flow.is_pending
  )
  return flow ? (flow.types ?? []) : null
}

/** allauth wants the password again before a sensitive change (2FA on/off). */
export function needsReauthentication(error: unknown) {
  return flowsOf(error).some((flow) => flow.id === "reauthenticate")
}

/**
 * allauth sends WebAuthn options as `{ publicKey: {...} }`, in the JSON
 * (base64url) form that `@simplewebauthn/browser` turns into the browser's
 * `navigator.credentials` calls.
 */
export function creationOptionsJSON(options: Record<string, unknown>) {
  return options.publicKey as PublicKeyCredentialCreationOptionsJSON
}

export function requestOptionsJSON(options: Record<string, unknown>) {
  return options.publicKey as PublicKeyCredentialRequestOptionsJSON
}

/**
 * A failed passkey prompt: the browser's own errors (closed, timed out, the
 * device already registered) aren't the API's.
 */
export function passkeyErrorMessage(error: unknown) {
  if (error instanceof Error && error.name === "NotAllowedError") {
    return "The passkey prompt was closed or timed out. Try again, or use another method."
  }
  if (error instanceof Error && error.name === "InvalidStateError") {
    return "This device already has a passkey for your account."
  }
  return getServerErrorMessage(error)
}
