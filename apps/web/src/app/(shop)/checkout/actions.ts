"use server"
import {
  type Checkout,
  checkoutCreate,
  type DocumentTypeEnum,
  type VatCondition,
} from "@workspace/api-client"
import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { djangoFetch, failedResponse } from "@/lib/django"
import { type FormState, textOf } from "@/lib/form-state"

const FIELDS = [
  "email",
  "name",
  "phone",
  "document_type",
  "document_number",
  "vat_condition",
  "legal_name",
  "shipping_address",
] as const

/**
 * Places the order with the cart of the visitor's session (djangoFetch), and
 * goes to Mercado Pago to pay it; without a payment link (not configured, or
 * down), to the order, which offers to pay it. Django validates the data like
 * the admin's customers, and that it's enough for the invoice.
 */
export async function placeOrder(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, textOf(formData, field).trim()])
  )
  const text = (field: (typeof FIELDS)[number]) => values[field] ?? ""
  const body: Checkout = {
    email: text("email"),
    name: text("name"),
    phone: text("phone"),
    // The selects send ARCA's codes; Django rejects one it doesn't know.
    document_type: Number(text("document_type")) as DocumentTypeEnum,
    document_number: text("document_number"),
    vat_condition: Number(text("vat_condition")) as VatCondition,
    legal_name: text("legal_name"),
    shipping_address: text("shipping_address"),
  }

  let number: string
  let paymentUrl: string | null
  try {
    const { data } = await djangoFetch((options) =>
      checkoutCreate({ ...options, body, throwOnError: true })
    )
    number = data.number
    paymentUrl = data.payment_url
  } catch (error) {
    const response = failedResponse(error)
    const data = (response?.data ?? {}) as Record<string, unknown>
    // 409: products that stopped being for sale; 400 with `detail`: an empty cart.
    if (response?.status === 409 || typeof data.detail === "string") {
      return { formError: String(data.detail), values }
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
    return {
      formError: "We couldn't place your order. Try again.",
      values,
    }
  }

  // The header's cart is empty now.
  refresh()
  redirect(paymentUrl ?? `/orders/${number}`)
}
