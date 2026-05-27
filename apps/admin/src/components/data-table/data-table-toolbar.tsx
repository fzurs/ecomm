"use client"

import type { Column, Table } from "@tanstack/react-table"
import * as React from "react"

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { Button } from "@workspace/ui/components/button"

import { cn } from "@workspace/ui/lib/utils"
import {
  AsyncComboboxFilter,
  ComboboxFilter,
  TextFilter,
} from "./data-table-filter-variants"
import { X } from "lucide-react"
import { snakeCaseToTitle } from "@/lib/utils"

export function DataTableToolbar<TData>({
  table,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  table: Table<TData>
}) {
  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanFilter())

  const isFiltered = table.getState().columnFilters.length > 0

  const onReset = React.useCallback(() => table.resetColumnFilters(), [table])

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn("flex items-end justify-between gap-2", className)}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {columns.map((column) => (
          <DataTableToolbarFilter
            key={column.id}
            column={column}
            table={table}
          />
        ))}
        {isFiltered && (
          <Button variant="ghost" onClick={onReset}>
            <X />
            Reset
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

function DataTableToolbarFilter<TData>({
  column,
}: {
  column: Column<TData>
  table: Table<TData>
}) {
  const filterOpts = column.columnDef.meta?.filter

  const placeholder = filterOpts?.placeholder || snakeCaseToTitle(column.id)

  switch (filterOpts?.variant) {
    case "text":
      return (
        <TextFilter
          value={(column.getFilterValue() as string) ?? ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder={placeholder}
        />
      )
    case "select":
    case "multi-select":
      return (
        <ComboboxFilter
          multiple={filterOpts.variant === "multi-select"}
          value={
            column.getFilterValue() ??
            (filterOpts.variant === "multi-select" ? [] : null)
          }
          onValueChange={(value) => column.setFilterValue(value)}
          placeholder={placeholder}
          items={filterOpts.options ?? []}
        />
      )
    case "async-select":
    case "async-multi-select":
      return (
        <AsyncComboboxFilter
          multiple={filterOpts.variant === "async-multi-select"}
          value={
            column.getFilterValue() ??
            (filterOpts.variant === "async-multi-select" ? [] : null)
          }
          onValueChange={(value) => column.setFilterValue(value)}
          placeholder={placeholder}
          itemsQueryOptions={filterOpts.options}
        />
      )
    default:
      return null
  }
}
