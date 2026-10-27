import { formatPrice } from "@/lib/utils"
import { vatRates } from "@/lib/fiscal"
import { InvoiceDetail, InvoiceLine } from "@workspace/api-client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import React from "react"
import { InvoiceAmountsFooter } from "./invoice-amounts"

/** The lines of a voucher. With `amounts`, its authorized amounts go below. */
export function InvoiceLinesTable({
  lines,
  amounts,
  renderQuantity,
}: {
  lines: InvoiceLine[]
  amounts?: InvoiceDetail
  renderQuantity?: (line: InvoiceLine, index: number) => React.ReactNode
}) {
  // Prices are charged with IVA included, while the A and B footer starts
  // from the net amount: say so, or the numbers don't seem to add up.
  const vatIncluded = amounts?.letter !== "C" && (
    <span className="font-normal text-muted-foreground"> (IVA incl.)</span>
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead className="text-center">Quantity</TableHead>
          <TableHead className="text-right">Unit price{vatIncluded}</TableHead>
          <TableHead className="text-center">IVA</TableHead>
          <TableHead className="text-right">Subtotal{vatIncluded}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line, index) => (
          <TableRow key={line.id}>
            <TableCell>{line.description}</TableCell>
            <TableCell className="text-center">
              {renderQuantity?.(line, index) ?? line.quantity}
            </TableCell>
            <TableCell className="text-right">
              {formatPrice(line.unit_price)}
            </TableCell>
            <TableCell className="text-center text-muted-foreground">
              {vatRates[line.vat_rate]}
            </TableCell>
            <TableCell className="text-right font-semibold">
              {formatPrice(line.subtotal)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {amounts && <InvoiceAmountsFooter invoice={amounts} labelSpan={4} />}
    </Table>
  )
}
