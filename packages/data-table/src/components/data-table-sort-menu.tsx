import { Table } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { getColumnLabel } from "../lib/column"

// Only the sorted column shows its direction. Items keep the menu open, so the order can be
// flipped and seen without reopening it.
export function DataTableSortMenu<TData>({ table }: { table: Table<TData> }) {
  const columns = table.getAllColumns().filter((column) => column.getCanSort())

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <ArrowUpDown />
        Sort
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          {columns.map((column) => {
            const sorted = column.getIsSorted()
            const SortIcon = sorted === "asc" ? ArrowUp : ArrowDown
            return (
              <DropdownMenuItem
                key={column.id}
                closeOnClick={false}
                onClick={() => column.toggleSorting()}
              >
                {getColumnLabel(column)}
                {sorted && (
                  // `!` beats the item's focus:**:text-accent-foreground.
                  <SortIcon className="ml-auto text-muted-foreground!" />
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
