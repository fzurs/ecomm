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
import {
  getBrandQueryOptions,
  getBrandsQueryOptions,
  getCategoriesQueryOptions,
  getCategoryQueryOptions,
} from "@/lib/query-options"
import z from "zod"
import { schemas } from "@workspace/api-client"
import { snakeCaseToTitle } from "@/lib/utils"
import { getStatusIcon } from "@/app/(admin)/products/columns"

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
    table.resetColumnFilters()
  }, [table])

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

  switch (filterOpts?.variant) {
    case "text":
      return (
        <TextFilter
          value={(column.getFilterValue() as string) ?? ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder={column.id}
        />
      )
    case "categories":
      return (
        <AsyncComboboxFilter<z.infer<typeof schemas.Category>, true, string>
          multiple
          placeholder={column.id}
          itemsQueryOptions={getCategoriesQueryOptions()}
          getItemQueryOptions={(slug) => getCategoryQueryOptions({ slug })}
          filterValue={column.getFilterValue() as never}
          onFilterChange={column.setFilterValue}
          isItemEqualToValue={(a, b) => a.id === b.id}
          valueToFilterValue={(value) => value.slug as string}
        />
      )
    case "statuses":
      return (
        <ComboboxFilter
          placeholder={column.id}
          multiple
          items={schemas.StatusEnum.options}
          itemToStringLabel={snakeCaseToTitle}
          filterValue={(column.getFilterValue() as never) || null}
          onFilterChange={column.setFilterValue}
          itemToIcon={getStatusIcon}
        />
      )
    case "brands":
      return (
        <AsyncComboboxFilter<z.infer<typeof schemas.Category>, true, string>
          multiple
          placeholder={column.id}
          itemsQueryOptions={getBrandsQueryOptions()}
          getItemQueryOptions={(slug) => getBrandQueryOptions({ slug })}
          filterValue={column.getFilterValue() as never}
          onFilterChange={column.setFilterValue}
          isItemEqualToValue={(a, b) => a.id === b.id}
          valueToFilterValue={(value) => value.slug as string}
        />
      )
  }

  return null
}
