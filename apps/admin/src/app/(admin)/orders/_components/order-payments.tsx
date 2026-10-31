import { Order } from "@workspace/api-client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { format } from "date-fns"
import { StatusBadge } from "@/components/status"
import { formatPrice } from "@/lib/utils"
import { paymentStatuses } from "../_lib/payment-status"

/**
 * The Mercado Pago payments of a store order, newest first: each attempt of
 * the customer (a rejected card, then an approved one) is one.
 */
export function OrderPayments({ payments }: { payments: Order["payments"] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Mercado Pago ID</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              {format(payment.created_at, "MMM dd, yyyy - p")}
            </TableCell>
            <TableCell>
              <div className="flex flex-col items-start gap-1">
                <StatusBadge
                  {...paymentStatuses[payment.status ?? "created"]}
                />
                {payment.status_detail && (
                  <span className="text-xs text-muted-foreground">
                    {payment.status_detail}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs">
              {payment.provider_payment_id ?? "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatPrice(payment.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
