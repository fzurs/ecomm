"use client"

import type { Table } from "@tanstack/react-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { ListFilterIcon } from "lucide-react"

/**
 * Advanced table filter. Work in progress, developed in the admin playground
 * (/playground/table-filter): for now only the trigger with the active count.
 */
export function DataTableAdvancedFilter<TData>({
  table,
}: {
  table: Table<TData>
}) {
  const activeCount = table.getState().columnFilters.length

  return (
    <Button variant="outline">
      <ListFilterIcon />
      Filters
      {activeCount > 0 && (
        <Badge variant="secondary" className="rounded-sm px-1.5">
          {activeCount}
        </Badge>
      )}
    </Button>
  )
}
