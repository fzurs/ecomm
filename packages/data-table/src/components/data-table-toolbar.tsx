"use client"

import type { Column, Table } from "@tanstack/react-table"

import { DataTableViewOptions } from "./data-table-view-options"

import { cn } from "@workspace/ui/lib/utils"
import { useCallback, useEffect, useMemo } from "react"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { getColumnLabel } from "../lib/column"
import { Input } from "@workspace/ui/components/input"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import { DataTableDateFilter } from "./data-table-date-filter"
import { DataTableRangeFilter } from "./data-table-range-filter"

export function DataTableToolbar<TData>({
  table,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  table: Table<TData>
}) {
  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanFilter())

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn("flex items-end justify-between gap-2", className)}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {columns.map((column) => (
          <DataTableToolbarFilter key={column.id} column={column} />
        ))}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

function DataTableToolbarFilter<TData>({ column }: { column: Column<TData> }) {
  const meta = column.columnDef.meta

  const onFilterRender = useCallback(() => {
    switch (meta?.variant) {
      case "text":
        return (
          <Input
            className="w-auto"
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder={getColumnLabel(column)}
          />
        )
      case "number":
        return (
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            className="w-full"
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(e) => {
              column.setFilterValue(e.target.value)
            }}
            placeholder={getColumnLabel(column)}
          />
        )
      case "boolean":
        return (
          <ToggleGroup
            className="text-muted-foreground"
            variant="outline"
            type="single"
            value={String(column.getFilterValue())}
            onValueChange={(val) =>
              column.setFilterValue(
                val === "true" ? true : val === "false" ? false : null
              )
            }
          >
            {meta.options?.slice(0, 2).map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={`Toggle ${option.label}`}
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )
      case "select":
      case "multi-select":
        return (
          <DataTableFacetedFilter
            column={column}
            options={meta.options ?? []}
            multiple={meta.variant === "multi-select"}
            title={getColumnLabel(column)}
          />
        )
      case "date-range":
        return (
          <DataTableDateFilter column={column} title={getColumnLabel(column)} />
        )
      case "range":
        return (
          <DataTableRangeFilter
            column={column}
            title={getColumnLabel(column)}
          />
        )
      default:
        return null
    }
  }, [column, meta])

  return onFilterRender()
}
