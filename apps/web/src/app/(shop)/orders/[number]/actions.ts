"use server"
import { myOrdersPay } from "@workspace/api-client"
import { redirect } from "next/navigation"
import { djangoFetch, failedResponse } from "@/lib/django"

/**
 * Goes to Mercado Pago to pay the order: later, or again after a rejection.
 * Only an error comes back.
 */
export async function payOrder(number: string): Promise<{ error: string }> {
  let url: string
  try {
    const { data } = await djangoFetch((options) =>
      myOrdersPay({ ...options, path: { number }, throwOnError: true })
    )
    url = data.payment_url
  } catch (error) {
    const response = failedResponse(error)
    const detail = (response?.data as { detail?: unknown } | undefined)?.detail
    return {
      error:
        typeof detail === "string"
          ? detail
          : "We couldn't open the payment. Try again in a moment.",
    }
  }
  redirect(url)
}
