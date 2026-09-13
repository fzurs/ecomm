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
          items={[
            { label: "Invoices", href: "/invoices", type: "link" },
            { label: invoice.document_name, type: "page" },
          ]}
        />
      </AppHeader>
    </>
  )
}
