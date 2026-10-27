import { formatPrice } from "@/lib/utils"
import { InvoiceSummary } from "@workspace/api-client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "cn"
import { format } from "date-fns"
import Link from "next/link"
import { voucherName } from "../_lib/voucher-type"
import { InvoiceStatusBadge } from "./invoice-status-badge"

/** The invoice a note adjusts, or the notes of an invoice. */
export function RelatedVouchers({ vouchers }: { vouchers: InvoiceSummary[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Voucher</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vouchers.map((voucher) => (
          <TableRow key={voucher.id}>
            <TableCell>
              <Link
                href={`/invoices/${voucher.id}`}
                className={cn(buttonVariants({ variant: "link" }), "px-0")}
              >
                {voucherName(voucher)}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {voucher.issue_date
                ? format(voucher.issue_date, "MMM dd, yyyy")
                : "—"}
            </TableCell>
            <TableCell>
              <InvoiceStatusBadge status={voucher.status} />
            </TableCell>
            <TableCell className="text-right font-semibold">
              {formatPrice(voucher.total_amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
