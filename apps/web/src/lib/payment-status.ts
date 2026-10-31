import type { PaymentStatus } from "@workspace/api-client"

// Mercado Pago's statuses of a payment (payments.models.Payment.Status).

/** Started and not settled: e.g. cash, until it's paid at the counter. */
export const paymentInProgress: PaymentStatus[] = [
  "pending",
  "in_process",
  "authorized",
  "in_mediation",
]

/** Why a card was rejected, from Mercado Pago's `status_detail`. */
const rejections: Record<string, string> = {
  cc_rejected_insufficient_amount: "The card has insufficient funds.",
  cc_rejected_bad_filled_security_code: "The security code was wrong.",
  cc_rejected_bad_filled_date: "The expiration date was wrong.",
  cc_rejected_bad_filled_card_number: "The card number was wrong.",
  cc_rejected_bad_filled_other: "Some card details were wrong.",
  cc_rejected_call_for_authorize:
    "The card issuer needs you to authorize the payment.",
  cc_rejected_card_disabled: "The card is disabled.",
  cc_rejected_duplicated_payment: "You already made a payment for this amount.",
  cc_rejected_high_risk: "The payment was declined.",
  cc_rejected_max_attempts: "Too many attempts with this card.",
}

export function rejectionReason(detail: string) {
  return rejections[detail] ?? "The payment was declined."
}
