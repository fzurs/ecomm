import { StatusBadge } from "@/components/status"
import { InvoiceStatus } from "@workspace/api-client"
import { invoiceStatuses } from "../_lib/invoice-status"

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <StatusBadge {...invoiceStatuses[status]} />
}
