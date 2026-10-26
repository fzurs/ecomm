"use client"

import type { Table } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { LockIcon, Settings2Icon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { getColumnLabel } from "../lib/column"

// Lists every data column; display columns (no accessor, like the row actions)
// are left out. The ones that can't be hidden show a lock instead of a check.
export function DataTableViewOptions<TData>({
  table,
}: {
  table: Table<TData>
}) {
  const columns = table
    .getAllColumns()
    .filter((column) => column.accessorFn !== undefined)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <Settings2Icon />
        View
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Columns</DropdownMenuLabel>
          {columns.map((column) =>
            column.getCanHide() ? (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={column.toggleVisibility}
              >
                {getColumnLabel(column)}
              </DropdownMenuCheckboxItem>
            ) : (
              // Same right padding and icon spot as the check of the items above.
              <DropdownMenuItem
                key={column.id}
                disabled
                className="pr-8 data-disabled:opacity-100"
              >
                {getColumnLabel(column)}
                <LockIcon className="absolute right-2 text-muted-foreground" />
                <span className="sr-only">(always visible)</span>
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
