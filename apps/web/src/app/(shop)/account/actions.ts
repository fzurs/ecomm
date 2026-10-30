"use server"
import { authUserPartialUpdate } from "@workspace/api-client"
import { refresh } from "next/cache"
import { djangoFetch, failedResponse } from "@/lib/django"
import { type FormState, textOf } from "@/lib/form-state"

export type ProfileState = FormState & { saved?: boolean }

/** Saves the customer's name, through Django with their session (`djangoFetch`). */
export async function updateProfile(
  _: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const values = {
    first_name: textOf(formData, "first_name").trim(),
    last_name: textOf(formData, "last_name").trim(),
  }

  try {
    await djangoFetch((options) =>
      authUserPartialUpdate({ ...options, body: values, throwOnError: true })
    )
  } catch (error) {
    const response = failedResponse(error)
    if (response?.status === 400) {
      // DRF's errors: { field: [messages] }.
      const errors = response.data as Record<string, string[]>
      const fieldErrors = Object.fromEntries(
        Object.entries(errors).map(([field, messages]) => [field, messages[0]])
      )
      return { fieldErrors, values }
    }
    const formError =
      response?.status === 401 || response?.status === 403
        ? "Your session expired. Sign in again."
        : "We couldn't save your name. Try again."
    return { formError, values }
  }

  // The header shows the name too.
  refresh()
  return { saved: true, values }
}
