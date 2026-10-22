"use client"

import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { DataTable } from "@workspace/data-table/components/data-table"
import { DataTableAdvancedFilter } from "@workspace/data-table/components/data-table-advanced-filter"
import { DataTableFilterMenu } from "@workspace/data-table/components/data-table-filter-menu"
import { DataTableToolbar } from "@workspace/data-table/components/data-table-toolbar"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { Button } from "@workspace/ui/components/button"
import { demoColumns, demoRows } from "../_lib/demo-table"
import {
  PlaygroundSection,
  PlaygroundValue,
} from "../_components/playground-section"

const data = { results: demoRows, count: demoRows.length }

export default function TableFilterPlaygroundPage() {
  // Same hook as the real tables: filters live in the URL and aren't applied
  // client-side (the API filters), so what matters is the filter state below.
  const table = useDataTable({ data, columns: demoColumns })

  const columnFilters = table.getState().columnFilters

  return (
    <>
      <AppHeader>
        <AppHeaderNav
          parents={[{ label: "Playground", href: "/playground" }]}
          page="Table filter"
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-8 px-4 py-6 lg:px-6">
        <PlaygroundSection
          title="DataTableAdvancedFilter"
          description="New component, in development."
        >
          <DataTableAdvancedFilter table={table} />
        </PlaygroundSection>

        <PlaygroundSection
          title="Filter state"
          description="table.getState().columnFilters: what any filter produces, and what reaches the URL and the API query."
          className="flex-col"
        >
          <PlaygroundValue value={columnFilters} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            disabled={columnFilters.length === 0}
          >
            Reset filters
          </Button>
        </PlaygroundSection>

        <PlaygroundSection
          title="Reference: DataTableToolbar"
          description="Current desktop filters: one control per filterable column. The date variant has no control yet."
        >
          <DataTableToolbar table={table} className="w-full" />
        </PlaygroundSection>

        <PlaygroundSection
          title="Reference: DataTableFilterMenu"
          description="Current mobile filters: pick the columns to filter from a menu."
        >
          <DataTableFilterMenu table={table} />
        </PlaygroundSection>

        <PlaygroundSection
          title="Demo table"
          description="One column per filter variant."
          className="block p-0"
        >
          <DataTable table={table} />
        </PlaygroundSection>
      </main>
    </>
  )
}
