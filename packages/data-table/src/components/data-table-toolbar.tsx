"use client"

import type { Column, Table } from "@tanstack/react-table"
import * as React from "react"

import { DataTableViewOptions } from "./data-table-view-options"

import { cn } from "@workspace/ui/lib/utils"
import {
  BooleanFilter,
  DateRangeFilter,
  MultiSelectFilter,
  NumberFilter,
  RangeFilter,
  SelectFilter,
  TextFilter,
} from "./data-table-filter-variants"
import { useMemo } from "react"
import { FilterVariant } from "../core/default-parsers"

export function DataTableToolbar<TData>({
  table,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  table: Table<TData>
}) {
  const columns = useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table]
  )

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn("flex items-end justify-between gap-2", className)}
      {...props}
    >
      {children ?? (
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {columns.map((column) => (
            <DataTableToolbarFilter
              key={column.id}
              column={column}
              table={table}
            />
          ))}
        </div>
      )}
      <DataTableViewOptions table={table} />
    </div>
  )
}

function DataTableToolbarFilter<TData>({
  column,
}: {
  column: Column<TData>
  table: Table<TData>
}) {
  const variant = column.columnDef.meta?.variant

  const filterComponents = {
    text: TextFilter,
    number: NumberFilter,
    select: SelectFilter,
    "multi-select": MultiSelectFilter,
    boolean: BooleanFilter,
    range: RangeFilter,
    "date-range": DateRangeFilter,
    date: null,
  } satisfies Record<
    FilterVariant,
    React.ComponentType<{ column: typeof column }> | null
  >

  const Filter = variant ? filterComponents[variant] : undefined

  return Filter ? <Filter column={column} /> : null
}
