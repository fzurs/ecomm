"use client"

import type { Column, Table } from "@tanstack/react-table"
import * as React from "react"

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { Button } from "@workspace/ui/components/button"

import { cn } from "@workspace/ui/lib/utils"
import {
  ComboboxFilter,
  AsyncComboboxFitler,
  TextFilter,
  NewComboboxFilter,
} from "./data-table-filter-variants"
import { X } from "lucide-react"

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

  const onReset = React.useCallback(() => {
    // evita que desaparezca el objeto, por ejemplo en vez
    // de esto {} hace esto {name: null, category: []}
    table.resetColumnFilters(true)
  }, [table])

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn("flex items-center justify-between", className)}
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

  switch (filterOpts?.variant) {
    case "text":
      return <TextFilter column={column} />
    case "select":
    case "multi-select":
      return (
        <ComboboxFilter
          column={column}
          multiple={filterOpts.variant === "multi-select"}
          items={filterOpts.options}
        />
      )
    case "async-select":
    case "async-multi-select":
      return (
        <AsyncComboboxFitler
          column={column}
          multiple={filterOpts.variant === "async-multi-select"}
          {...filterOpts}
        />
      )
    case "combobox":
      return <NewComboboxFilter {...filterOpts} />
    default:
      return null
  }
}
