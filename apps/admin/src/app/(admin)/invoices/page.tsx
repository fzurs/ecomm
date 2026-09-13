"use client"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { SectionGroup } from "@/components/section"
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
      <SectionGroup>
        <DataTable table={table} />
      </SectionGroup>
    </>
  )
}
