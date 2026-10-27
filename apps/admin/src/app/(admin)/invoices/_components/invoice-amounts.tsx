import { formatPrice } from "@/lib/utils"
import { vatRates } from "@/lib/fiscal"
import { InvoiceDetail } from "@workspace/api-client"
import { cn } from "cn"

/**
 * The amounts as ARCA authorized them. A C voucher has no IVA breakdown; A and
 * B show the net amount and the IVA of each rate.
 */
export function InvoiceAmounts({
  invoice,
  className,
}: {
  invoice: InvoiceDetail
  className?: string
}) {
  const rows =
    invoice.letter === "C"
      ? []
      : [
          { label: "Net taxed", value: invoice.net_amount },
          ...invoice.vat.map((vat) => ({
            label: `IVA ${vatRates[vat.rate]}`,
            value: vat.amount,
          })),
          { label: "Exempt", value: invoice.exempt_amount, optional: true },
          {
            label: "Non-taxed",
            value: invoice.non_taxed_amount,
            optional: true,
          },
        ].filter((row) => !row.optional || Number(row.value) > 0)

  return (
    <dl
      className={cn(
        "ml-auto grid w-full max-w-xs grid-cols-[1fr_auto] gap-x-6 text-sm",
        className
      )}
    >
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="py-1 text-muted-foreground">{row.label}</dt>
          <dd className="py-1 text-right">{formatPrice(row.value)}</dd>
        </div>
      ))}
      <dt className="border-t py-2 font-semibold">Total</dt>
      <dd className="border-t py-2 text-right font-semibold">
        {formatPrice(invoice.total_amount)}
      </dd>
    </dl>
  )
}
