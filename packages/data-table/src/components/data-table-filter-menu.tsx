import { Column, Table } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { CheckIcon, ListFilterIcon, XIcon } from "lucide-react"
import { getColumnLabel } from "../lib/column"
import { filterVariantIcons } from "../lib/filter-icons"
import { useCallback, useState } from "react"
import { DataTableToolbarFilter } from "./data-table-toolbar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

export function DataTableFilterMenu<TData>({ table }: { table: Table<TData> }) {
  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanFilter() && column.columnDef.meta?.variant)

  const initialFilters = columns
    .filter((column) => column.getFilterValue() !== undefined)
    .map((column) => column.id)

  const [filters, setFilters] = useState<Set<string>>(new Set(initialFilters))

  const onSelect = useCallback(
    (column: Column<TData>) => {
      // Clearing the column filter updates the table's state (the URL), so it
      // can't run inside the updater below: React calls updaters while
      // rendering this component.
      if (filters.has(column.id)) column.setFilterValue(undefined)

      setFilters((prev) => {
        const next = new Set(prev)
        if (next.has(column.id)) next.delete(column.id)
        else next.add(column.id)
        return next
      })
    },
    [filters]
  )

  const onClear = () => {
    setFilters(new Set())
    table.resetColumnFilters()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {[...filters].map((filter) => {
        const column = columns.find((column) => column.id === filter)
        if (!column) return null
        return <DataTableToolbarFilter key={filter} column={column} />
      })}
      {filters.size > 0 && (
        <Button size="icon" variant="outline" onClick={onClear}>
          <XIcon />
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size={filters.size === 0 ? "default" : "icon"}
              variant="outline"
            />
          }
        >
          <ListFilterIcon />
          {filters.size === 0 && <span>Filters</span>}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44" align="start">
          {columns.map((column) => {
            const variant = column.columnDef.meta?.variant
            const VariantIcon = variant && filterVariantIcons[variant]
            return (
              <DropdownMenuItem
                key={column.id}
                onClick={() => onSelect(column)}
              >
                {VariantIcon && <VariantIcon />}
                {getColumnLabel(column)}
                {filters.has(column.id) && <CheckIcon className="ml-auto" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
