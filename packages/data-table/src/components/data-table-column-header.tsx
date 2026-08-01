"use client"

import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, EyeOff, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: {
  column: Column<TData, TValue>
  title?: string
}) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return title
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          {title}
          {column.getCanSort() &&
            (!column.getIsSorted() ? (
              <ArrowUpDown />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp />
            ) : (
              <ArrowDown />
            ))}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        {column.getCanSort() && (
          <DropdownMenuGroup>
            <DropdownMenuCheckboxItem
              checked={column.getIsSorted() === "asc"}
              onCheckedChange={() => column.toggleSorting(false)}
            >
              <ArrowUp />
              Sort asc
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={column.getIsSorted() === "desc"}
              onCheckedChange={() => column.toggleSorting(true)}
            >
              <ArrowDown />
              Sort desc
            </DropdownMenuCheckboxItem>
            {column.getIsSorted() && (
              <DropdownMenuCheckboxItem onClick={column.clearSorting}>
                <X />
                Remove sort
              </DropdownMenuCheckboxItem>
            )}
          </DropdownMenuGroup>
        )}
        {column.getCanSort() && column.getCanHide() && (
          <DropdownMenuSeparator />
        )}
        {column.getCanHide() && (
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff />
              Hide column
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
