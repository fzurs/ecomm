"use server"
import { revocationsRequest } from "@workspace/api-client"
import { djangoFetch, failedResponse } from "@/lib/django"
import { type FormState, textOf } from "@/lib/form-state"

export type RevocationState = FormState & { code?: string }

const FIELDS = ["order_number", "email", "reason"] as const

/**
 * The "botón de arrepentimiento": asks Django to revoke the purchase with the
 * order's number and email (no session needed), and answers with the request's
 * code, which the law asks to give right away.
 */
export async function requestRevocation(
  _: RevocationState,
  formData: FormData
): Promise<RevocationState> {
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, textOf(formData, field).trim()])
  ) as Record<(typeof FIELDS)[number], string>

  try {
    const { data } = await djangoFetch((options) =>
      revocationsRequest({ ...options, body: values, throwOnError: true })
    )
    return { code: data.code, values }
  } catch (error) {
    const response = failedResponse(error)
    const data = (response?.data ?? {}) as Record<string, unknown>
    if (response?.status === 429) {
      return {
        formError: "Too many attempts. Try again in a while.",
        values,
      }
    }
    if (typeof data.detail === "string") {
      return { formError: data.detail, values }
    }
    if (response?.status === 400) {
      // DRF's errors: { field: [messages] }.
      const fieldErrors = Object.fromEntries(
        Object.entries(data).map(([field, messages]) => [
          field,
          String((messages as string[])[0]),
        ])
      )
      return { fieldErrors, values }
    }
    return { formError: "We couldn't send your request. Try again.", values }
  }
}
