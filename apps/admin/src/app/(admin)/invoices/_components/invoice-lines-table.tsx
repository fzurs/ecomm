import { formatPrice } from "@/lib/utils"
import { vatRates } from "@/lib/fiscal"
import { InvoiceLine } from "@workspace/api-client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import React from "react"

export function InvoiceLinesTable({
  lines,
  renderQuantity,
}: {
  lines: InvoiceLine[]
  renderQuantity?: (line: InvoiceLine, index: number) => React.ReactNode
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead className="text-center">Quantity</TableHead>
          <TableHead className="text-right">Unit price</TableHead>
          <TableHead className="text-center">IVA</TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line, index) => (
          <TableRow key={line.id}>
            <TableCell>{line.description}</TableCell>
            <TableCell className="text-center">
              {renderQuantity?.(line, index) ?? line.quantity}
            </TableCell>
            {/* IVA included, as charged. */}
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
    </Table>
  )
}
