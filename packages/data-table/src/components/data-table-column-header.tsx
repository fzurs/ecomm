"use client"

import type { Column } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: {
  column: Column<TData, TValue>
  title?: string
}) {
  return (
    <Button
      size="xs"
      variant="ghost"
      className="-mx-2 uppercase"
      onClick={() => column.toggleSorting()}
      aria-label={`Toggle sorting by ${title}`}
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ArrowUp />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDown />
      ) : (
        <ArrowUpDown />
      )}
    </Button>
  )
}
