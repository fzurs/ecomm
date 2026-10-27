"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { InvoiceDetail } from "@workspace/api-client"
import { invoicesRetrieveOptions } from "@workspace/api-client/query"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { CircleAlertIcon } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import {
  CreditNoteForm,
  useCreditNoteForm,
} from "../../_components/credit-note-form"
import { voucherName } from "../../_lib/voucher-type"

export default function CreditNotePage() {
  const params = useParams<{ id: string }>()
  const { data: invoice } = useSuspenseQuery(
    invoicesRetrieveOptions({ path: { id: Number(params.id) } })
  )

  return (
    <>
      <AppHeader>
        <AppHeaderNav
          parents={[
            { label: "Invoices", href: "/invoices" },
            { label: voucherName(invoice), href: `/invoices/${invoice.id}` },
          ]}
          page="Credit note"
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col">
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
          <div className="typeset">
            <h1>Credit note</h1>
            <p>
              For {voucherName(invoice)}, to {invoice.receptor_name}.
            </p>
          </div>
          {invoice.notes_unavailable_reason ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertTitle>No notes on this voucher</AlertTitle>
              <AlertDescription>
                {invoice.notes_unavailable_reason}
              </AlertDescription>
            </Alert>
          ) : (
            <CreditNoteFormSection invoice={invoice} />
          )}
        </div>
      </main>
    </>
  )
}

function CreditNoteFormSection({ invoice }: { invoice: InvoiceDetail }) {
  const router = useRouter()
  const form = useCreditNoteForm({
    invoice,
    onSuccess: (note) => router.push(`/invoices/${note.id}`),
  })

  return <CreditNoteForm form={form} invoice={invoice} />
}
