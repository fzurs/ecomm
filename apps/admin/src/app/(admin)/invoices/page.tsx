"use client"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { useQuery } from "@tanstack/react-query"
import { DataTable } from "@workspace/data-table/components/data-table"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { invoicesListOptions } from "@workspace/api-client/query"
import { columns } from "./columns"

export default function InvoicesPage() {
  const { data } = useQuery(invoicesListOptions())

  const table = useDataTable({ data, columns })

  return (
    <>
      <AppHeader>
        <AppHeaderNav
          items={[{ label: "Invoices", href: "/invoices", type: "page" }]}
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <DataTable table={table} />
      </main>
    </>
  )
}
