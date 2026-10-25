"use client"

import type { Column, Table } from "@tanstack/react-table"

import { DataTableViewOptions } from "./data-table-view-options"

import { cn } from "cn"
import { useCallback } from "react"
import { DataTableMultiSelectFilter } from "./data-table-multi-select-filter"
import { DataTableSelectFilter } from "./data-table-select-filter"
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

export function DataTableToolbarFilter<TData>({
  column,
}: {
  column: Column<TData>
}) {
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
            value={[String(column.getFilterValue())]}
            onValueChange={([val]) =>
              column.setFilterValue(
                val === "true" ? true : val === "false" ? false : null
              )
            }
          >
            {/* An option with an icon shows only the icon; the label stays as
                its accessible name and tooltip. */}
            {meta.options?.slice(0, 2).map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={`Toggle ${option.label}`}
                title={option.icon ? option.label : undefined}
              >
                {option.icon ?? option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )
      case "select":
        return (
          <DataTableSelectFilter
            column={column}
            options={meta.options ?? []}
            title={getColumnLabel(column)}
          />
        )
      case "multi-select":
        return (
          <DataTableMultiSelectFilter
            column={column}
            options={meta.options ?? []}
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
