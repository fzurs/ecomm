"use client"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { useSuspenseQuery } from "@tanstack/react-query"
import { invoicesRetrieveOptions } from "@workspace/api-client/query"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useParams } from "next/navigation"
import { ArcaMessages } from "../_components/arca-messages"
import { InvoiceActions } from "../_components/invoice-actions"
import { InvoiceAmounts } from "../_components/invoice-amounts"
import { InvoiceDetails } from "../_components/invoice-details"
import { InvoiceLinesTable } from "../_components/invoice-lines-table"
import { InvoiceStatusBadge } from "../_components/invoice-status-badge"
import { RelatedVouchers } from "../_components/related-vouchers"
import { VoucherTypeBadge } from "../_components/voucher-type-badge"
import { voucherName } from "../_lib/voucher-type"

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: invoice } = useSuspenseQuery(
    invoicesRetrieveOptions({ path: { id: Number(params.id) } })
  )

  return (
    <>
      <AppHeader>
        <AppHeaderNav
          parents={[{ label: "Invoices", href: "/invoices" }]}
          page={voucherName(invoice)}
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col">
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="typeset">
              <h1>{voucherName(invoice)}</h1>
              <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="size-4" />
                Created {format(invoice.created_at, "MMMM dd, yyyy - p")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <VoucherTypeBadge voucherType={invoice.voucher_type} />
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </div>

          <InvoiceActions invoice={invoice} />
          <ArcaMessages invoice={invoice} />

          <section className="flex flex-col gap-4">
            <div className="typeset">
              <h2>Lines</h2>
            </div>
            <InvoiceLinesTable lines={invoice.lines} />
            <InvoiceAmounts invoice={invoice} />
          </section>
          <section className="flex flex-col gap-4">
            <div className="typeset">
              <h2>Details</h2>
            </div>
            <InvoiceDetails invoice={invoice} />
          </section>
          {invoice.associated_invoice && (
            <section className="flex flex-col gap-4">
              <div className="typeset">
                <h2>Associated invoice</h2>
              </div>
              <RelatedVouchers vouchers={[invoice.associated_invoice]} />
            </section>
          )}
          {invoice.notes.length > 0 && (
            <section className="flex flex-col gap-4">
              <div className="typeset">
                <h2>Notes</h2>
              </div>
              <RelatedVouchers vouchers={invoice.notes} />
            </section>
          )}
        </div>
      </main>
    </>
  )
}
