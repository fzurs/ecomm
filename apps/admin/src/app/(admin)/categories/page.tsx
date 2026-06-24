"use client"
import { DataTable } from "@/components/data-table/data-table"
import {
  PageContent,
  PageHeader,
  PageHeaderHeading,
} from "@/components/page-header"
import { useDataTable } from "@/hooks/use-data-table"
import { getCategoriesQueryOptions } from "@/lib/query-options"
import { useQuery } from "@tanstack/react-query"
import { columns } from "./columns"

export default function CategoriesPage() {
  const { data } = useQuery(getCategoriesQueryOptions())

  const table = useDataTable({ data, columns })

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Categories</PageHeaderHeading>
      </PageHeader>
      <PageContent>
        <DataTable table={table} />
      </PageContent>
    </>
  )
}
