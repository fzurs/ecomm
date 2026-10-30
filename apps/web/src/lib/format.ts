// Prices as the admin shows them (apps/admin/src/lib/utils.ts): pesos, with
// cents only when there are any.
const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  trailingZeroDisplay: "stripIfInteger",
})

export function formatPrice(price: number | null | undefined) {
  return price == null ? null : priceFormatter.format(price)
}
