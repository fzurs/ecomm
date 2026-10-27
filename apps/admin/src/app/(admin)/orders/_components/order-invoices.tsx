"use client"
import { useQuery } from "@tanstack/react-query"
import { Order } from "@workspace/api-client"
import { invoicesListOptions } from "@workspace/api-client/query"
import { Button } from "@workspace/ui/components/button"
import { FileTextIcon } from "lucide-react"
import { useState } from "react"
import { RelatedVouchers } from "../../invoices/_components/related-vouchers"
import { OrderInvoiceDialog } from "./order-invoice-dialog"

/** The vouchers of the order (its invoice and notes), and invoicing it. */
export function OrderInvoices({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)
  const { data } = useQuery(
    invoicesListOptions({ query: { order: order.id, ordering: "created_at" } })
  )
  const vouchers = data?.results ?? []
  // A rejected invoice is emitted again from the same dialog.
  const invoiced = vouchers.some(
    (voucher) => voucher.kind === "invoice" && voucher.status !== "rejected"
  )

  return (
    <div className="flex flex-col gap-4">
      {vouchers.length > 0 ? (
        <RelatedVouchers vouchers={vouchers} />
      ) : (
        <p className="text-muted-foreground">Not invoiced yet.</p>
      )}
      {order.status === "paid" && !invoiced && (
        <div>
          <Button variant="outline" onClick={() => setOpen(true)}>
            <FileTextIcon />
            Create invoice
          </Button>
          <OrderInvoiceDialog
            order={order}
            open={open}
            onOpenChange={setOpen}
          />
        </div>
      )}
    </div>
  )
}
