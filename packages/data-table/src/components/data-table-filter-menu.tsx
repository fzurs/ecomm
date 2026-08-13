import { Column, Table } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { CheckIcon, ListFilterIcon, XIcon } from "lucide-react"
import { getColumnLabel } from "../lib/column"
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
    (column: Column<TData>) =>
      setFilters((prev) => {
        const filters = new Set(prev)

        if (filters.has(column.id)) {
          filters.delete(column.id)
          column.setFilterValue(undefined)
        } else {
          filters.add(column.id)
        }

        return filters
      }),
    [setFilters]
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
        <DropdownMenuTrigger asChild>
          <Button
            size={filters.size === 0 ? "default" : "icon"}
            variant="outline"
          >
            <ListFilterIcon />
            {filters.size === 0 && <span>Filters</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44" align="start">
          {columns.map((column) => (
            <DropdownMenuItem key={column.id} onSelect={() => onSelect(column)}>
              {getColumnLabel(column)}
              {filters.has(column.id) && <CheckIcon className="ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
