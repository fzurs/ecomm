import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InvoiceDetail } from "@workspace/api-client"
import {
  invoicesCreateMutation,
  invoicesEmitMutation,
  invoicesVerifyMutation,
} from "@workspace/api-client/query"
import { toast } from "sonner"
import { getServerErrorMessage } from "@/lib/utils"
import { invalidateInvoices } from "../_lib/invalidate-invoices"
import { voucherName } from "../_lib/voucher-type"

/**
 * Tells how an emission ended. ARCA answers on the voucher (rejected and
 * unverified are 2xx responses), so the toast depends on its status.
 */
export function toastEmission(invoice: InvoiceDetail) {
  const name = voucherName(invoice)
  switch (invoice.status) {
    case "authorized":
      toast.success(`${name} authorized`, {
        description: `CAE ${invoice.cae}`,
      })
      break
    case "rejected":
      toast.error(`${name} rejected`, { description: invoice.error_message })
      break
    case "unverified":
      toast.warning(`${name} unverified`, {
        description:
          "The connection to ARCA dropped. Verify it before anything else: emitting it again could duplicate it.",
      })
      break
  }
}

// The callbacks every emission shares.
function useEmissionCallbacks() {
  const queryClient = useQueryClient()
  return {
    onSuccess: (invoice: InvoiceDetail) => toastEmission(invoice),
    onError: (error: unknown) => toast.error(getServerErrorMessage(error)),
    onSettled: () => invalidateInvoices(queryClient),
  }
}

export function useCreateInvoice() {
  return useMutation({ ...invoicesCreateMutation(), ...useEmissionCallbacks() })
}

/** Emits a rejected voucher again. */
export function useEmitInvoice() {
  return useMutation({ ...invoicesEmitMutation(), ...useEmissionCallbacks() })
}

/** Asks ARCA whether an unverified voucher was authorized. */
export function useVerifyInvoice() {
  return useMutation({ ...invoicesVerifyMutation(), ...useEmissionCallbacks() })
}
