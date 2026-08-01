"use client"

import type { Column, Table } from "@tanstack/react-table"
import * as React from "react"

import { DataTableViewOptions } from "./data-table-view-options"

import { cn } from "@workspace/ui/lib/utils"
import {
  ComboboxFilter,
  DateRangeFilter,
  RangeFilter,
} from "./data-table-filter-variants"
import { Input } from "@workspace/ui/components/input"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@workspace/ui/components/combobox"

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
      <DataTableViewOptions table={table} />
    </div>
  )
}

function capitalize(str: string) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function DataTableToolbarFilter<TData>({
  column,
}: {
  column: Column<TData>
  table: Table<TData>
}) {
  const columnMeta = column.columnDef.meta
  const variant = columnMeta?.variant

  const label =
    typeof column.columnDef.header === "string"
      ? column.columnDef.header
      : capitalize(column.id)

  const options =
    columnMeta?.options?.map((option) =>
      typeof option === "string"
        ? { label: capitalize(option), value: option }
        : option
    ) ?? []

  switch (variant) {
    case "text":
      return (
        <Input
          className="w-auto"
          value={(column.getFilterValue() as string) ?? ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder={label}
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
          placeholder={label}
        />
      )
    // case "boolean":
    //   return (
    //     <ToggleGroup
    //       variant="outline"
    //       type="single"
    //       value={String(column.getFilterValue())}
    //       onValueChange={(val) =>
    //         column.setFilterValue(
    //           val === "true" ? true : val === "false" ? false : null
    //         )
    //       }
    //     >
    //       {options.slice(0, 2).map((option) => (
    //         <ToggleGroupItem
    //           key={option.value}
    //           value={option.value}
    //           aria-label={`Toggle ${option.label}`}
    //           className="w-auto"
    //         >
    //           {option.label}
    //         </ToggleGroupItem>
    //       ))}
    //     </ToggleGroup>
    //   )
    // case "range":
    //   return (
    //     <RangeFilter
    //       range={(column.getFilterValue() as number[]) ?? []}
    //       setRange={column.setFilterValue}
    //       placeholder={label}
    //     />
    //   )
    // case "date-range":
    //   return (
    //     <DateRangeFilter
    //       range={(column.getFilterValue() as Date[]) ?? []}
    //       setRange={column.setFilterValue}
    //       placeholder={label}
    //     />
    //   )
    // case "select":
    //   return (
    //     <ComboboxFilter
    //       autoHighlight
    //       value={column.getFilterValue() ?? null}
    //       onValueChange={column.setFilterValue}
    //       placeholder={label}
    //       items={options}
    //     />
    //   )
    // case "multi-select":
    //   return (
    //     <ComboboxFilter
    //       multiple
    //       autoHighlight
    //       value={(column.getFilterValue() as string[]) ?? []}
    //       onValueChange={(val) =>
    //         column.setFilterValue(val.length > 0 ? val : null)
    //       }
    //       placeholder={label}
    //       items={options}
    //     />
    //   )
    // case "async-select":
    //   return (
    //     <AsyncComboboxFilter
    //       autoHighlight
    //       value={column.getFilterValue() ?? null}
    //       onValueChange={column.setFilterValue}
    //       placeholder={label}
    //       items={columnMeta?.options?.map((option) => ({label: option,value: option}))}
    //     />
    //   )
    // case "async-multi":
    //   return (
    //     <AsyncComboboxFilter
    //       multiple
    //       autoHighlight
    //       value={(column.getFilterValue() as string[]) ?? []}
    //       onValueChange={(val) =>
    //         column.setFilterValue(val.length > 0 ? val : null)
    //       }
    //       placeholder={label}
    //       items={columnMeta?.options?.map((option) => ({label: option,value: option}))}

    //     />
    //   )

    default:
      return null
  }
}
