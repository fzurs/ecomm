"use client"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { useSuspenseQuery } from "@tanstack/react-query"
import { invoicesRetrieveOptions } from "@workspace/api-client/query"
import { useParams } from "next/navigation"

export default function InvoicesDetailPage() {
  const params = useParams<{ id: string }>()
  const invoiceId = Number(params.id)
  const { data: invoice } = useSuspenseQuery(
    invoicesRetrieveOptions({ path: { id: invoiceId } })
  )

  return (
    <>
      <AppHeader>
        <AppHeaderNav
          parents={[{ label: "Invoices", href: "/invoices" }]}
          page={invoice.document_name}
        />
      </AppHeader>
    </>
  )
}
