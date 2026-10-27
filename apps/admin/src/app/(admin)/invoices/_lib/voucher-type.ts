import { VoucherKind, VoucherType } from "@workspace/api-client"
import { zVoucherType } from "@workspace/api-client/zod"

// ARCA's names: they are what goes on the voucher. Keyed by the generated enum.
export const voucherTypes: Record<VoucherType, string> = {
  1: "Factura A",
  2: "Nota de Débito A",
  3: "Nota de Crédito A",
  6: "Factura B",
  7: "Nota de Débito B",
  8: "Nota de Crédito B",
  11: "Factura C",
  12: "Nota de Débito C",
  13: "Nota de Crédito C",
}

export const voucherKinds: Record<VoucherKind, string> = {
  invoice: "Invoice",
  credit_note: "Credit note",
  debit_note: "Debit note",
}

export const voucherTypeOptions = zVoucherType.options.map(({ value }) => ({
  value: String(value),
  label: voucherTypes[value],
}))

/** "Factura A 00001-00000008", or the type alone before ARCA numbers it. */
export function voucherName(invoice: {
  voucher_type: VoucherType
  display_number: string | null
}) {
  const type = voucherTypes[invoice.voucher_type]
  return invoice.display_number ? `${type} ${invoice.display_number}` : type
}
