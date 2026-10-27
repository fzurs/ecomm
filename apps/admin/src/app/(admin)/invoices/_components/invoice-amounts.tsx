import { formatPrice } from "@/lib/utils"
import { vatRates } from "@/lib/fiscal"
import { InvoiceDetail } from "@workspace/api-client"
import {
  TableCell,
  TableFooter,
  TableRow,
} from "@workspace/ui/components/table"

/**
 * The amounts as ARCA authorized them, as the footer of the lines table. A C
 * voucher has no IVA breakdown; A and B show the net amount and the IVA of
 * each rate. `labelSpan` is the number of columns before the subtotal.
 */
export function InvoiceAmountsFooter({
  invoice,
  labelSpan,
}: {
  invoice: InvoiceDetail
  labelSpan: number
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
    <TableFooter>
      {rows.map((row) => (
        <TableRow key={row.label} className="border-0 hover:bg-transparent">
          <TableCell
            colSpan={labelSpan}
            className="py-1.5 text-right font-normal text-muted-foreground"
          >
            {row.label}
          </TableCell>
          <TableCell className="py-1.5 text-right font-normal">
            {formatPrice(row.value)}
          </TableCell>
        </TableRow>
      ))}
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={labelSpan} className="text-right font-semibold">
          Total
        </TableCell>
        <TableCell className="text-right font-semibold">
          {formatPrice(invoice.total_amount)}
        </TableCell>
      </TableRow>
    </TableFooter>
  )
}
