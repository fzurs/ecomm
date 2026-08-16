import { Table } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { getColumnLabel } from "../lib/column"

export function DataTableSortMenu<TData>({ table }: { table: Table<TData> }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <ArrowUpDown />
          Sort
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup heading="Sort by">
              {table
                .getAllColumns()
                .filter((column) => column.getCanSort())
                .map((column) => (
                  <CommandItem
                    key={column.id}
                    value={column.id}
                    onSelect={() => {
                      column.toggleSorting()
                    }}
                    className="justify-between"
                  >
                    {getColumnLabel(column)}
                    {column.getIsSorted() === "desc" ? (
                      <ArrowDown />
                    ) : column.getIsSorted() === "asc" ? (
                      <ArrowUp />
                    ) : null}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
