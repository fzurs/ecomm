import { client } from "@workspace/api-client/allauth/client"
import {
  deleteAllauthBrowserV1AuthSession,
  type ErrorResponse,
  type Flow,
} from "@workspace/api-client/allauth"
import type { FormState } from "@/lib/form-state"

// The browser's calls to allauth (logging in, signing up, the account): same
// origin, through /api, so Django sets the session cookie on the store's
// domain. Only client components import this module: the server passes its
// own options to every call (src/lib/django.ts).
client.setConfig({ baseURL: "/api" })
client.instance.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase() ?? "GET"
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && !csrfToken()) {
    // The store reads the session on its server, so the browser may not have
    // the token yet: Django sets it on any read of /auth/user/, with or
    // without a session.
    await fetch("/api/auth/user/")
  }
  const token = csrfToken()
  if (token) config.headers.set("X-CSRFToken", token)
  return config
})

/** The token Django checks on every write with a session: only this origin can read it. */
function csrfToken() {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrftoken="))
    ?.slice("csrftoken=".length)
}

/** Ends the session. allauth answers 401 once it's gone: that's the success. */
export async function logout() {
  await deleteAllauthBrowserV1AuthSession()
}

function responseOf(error: unknown) {
  return (error as { response?: { status?: number; data?: unknown } } | null)
    ?.response
}

export function statusOf(error: unknown) {
  return responseOf(error)?.status
}

/**
 * The flow allauth is waiting for, from its 401: e.g. `verify_email` after
 * signing up, or `provider_signup` when Google's email belongs to an account
 * it won't log into. Null if none is pending.
 */
export function pendingFlow(error: unknown): Flow["id"] | null {
  const response = responseOf(error)
  if (response?.status !== 401) return null
  const flows =
    (response.data as { data?: { flows?: Flow[] } } | undefined)?.data?.flows ??
    []
  return flows.find((flow) => flow.is_pending)?.id ?? null
}

/**
 * allauth's errors for a form: `{ errors: [{ param, message }] }` by field
 * (the input's name), the rest for the whole form.
 */
export function formErrors(error: unknown): FormState {
  const response = responseOf(error)
  if (!response) {
    return {
      formError:
        "We couldn't reach the store. Check your connection and try again.",
    }
  }
  if (response.status === 429) {
    return { formError: "Too many attempts. Wait a few minutes and try again." }
  }
  if (response.status === 401 || response.status === 403) {
    return { formError: "Your session expired. Sign in again." }
  }

  const errors = (response.data as ErrorResponse | undefined)?.errors
  if (response.status !== 400 || !errors?.length) {
    return { formError: "Something went wrong. Try again." }
  }
  const fieldErrors: Partial<Record<string, string>> = {}
  let formError: string | undefined
  for (const { param, message } of errors) {
    if (param) fieldErrors[param] ??= message
    else formError ??= message
  }
  return { fieldErrors, formError }
}
