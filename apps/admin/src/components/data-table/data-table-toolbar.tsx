"use client"

import type { Column, Table } from "@tanstack/react-table"
import * as React from "react"

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

import { cn } from "@workspace/ui/lib/utils"
import {
  AsyncComboboxFilter,
  ComboboxFilter,
  DateRangeFilter,
  RangeFilter,
} from "./data-table-filter-variants"
import { snakeCaseToTitle } from "@/lib/utils"
import { Input } from "@workspace/ui/components/input"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"

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
  const filterMeta = column.columnDef.meta?.filter

  const placeholder = filterMeta?.placeholder || snakeCaseToTitle(column.id)
  const value = column.getFilterValue() as any
  const setValue = column.setFilterValue

  switch (filterMeta?.variant) {
    case "text":
      return (
        <Input
          className="w-auto"
          value={value ?? ""}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
        />
      )
    case "number":
      return (
        <Input
          className="w-auto"
          value={value ?? ""}
          onChange={(e) => {
            const newValue = e.target.value
            setValue(newValue ? Number(newValue) : null)
          }}
          placeholder={placeholder}
        />
      )
    case "boolean":
      return (
        <ToggleGroup
          variant="outline"
          type="single"
          value={String(value)}
          onValueChange={(val) =>
            setValue(val === "true" ? true : val === "false" ? false : null)
          }
        >
          {filterMeta.options.slice(0, 2).map((option) => {
            const optionValue = String(option.value)
            return (
              <ToggleGroupItem
                key={optionValue}
                value={optionValue}
                aria-label={`Toggle ${optionValue}`}
                className="w-auto"
              >
                {option.icon} {option.label}
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
      )
    case "range":
      return (
        <RangeFilter
          range={value ?? []}
          setRange={setValue}
          placeholder={placeholder}
        />
      )
    case "date-range":
      return (
        <DateRangeFilter
          range={value ?? []}
          setRange={setValue}
          placeholder={placeholder}
        />
      )
    case "select":
      return (
        <ComboboxFilter
          autoHighlight
          value={value ?? null}
          onValueChange={setValue}
          placeholder={placeholder}
          items={filterMeta.options}
        />
      )
    case "multi-select":
      return (
        <ComboboxFilter
          multiple
          autoHighlight
          value={value ?? []}
          onValueChange={(val) => setValue(val.length > 0 ? val : null)}
          placeholder={placeholder}
          items={filterMeta.options}
        />
      )
    case "async-select":
      return (
        <AsyncComboboxFilter
          autoHighlight
          value={value ?? null}
          onValueChange={setValue}
          placeholder={placeholder}
          items={filterMeta.options}
        />
      )
    case "async-multi":
      return (
        <AsyncComboboxFilter
          multiple
          autoHighlight
          value={value ?? []}
          onValueChange={(val) => setValue(val.length > 0 ? val : null)}
          placeholder={placeholder}
          items={filterMeta.options}
        />
      )

    default:
      return null
  }
}
