"use client"

import type { Column } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

// The sort button shows on hover of the header cell (`group/th`, set by DataTable) or on
// keyboard focus, and always while the column is sorted, so the current order stays visible.
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: {
  column: Column<TData, TValue>
  title?: string
}) {
  const sorted = column.getIsSorted()

  return (
    <div className="flex items-center gap-1">
      <span className="flex-1">{title}</span>
      <Button
        size="icon-xs"
        variant="ghost"
        className={cn(
          "opacity-0 group-hover/th:opacity-100 focus-visible:opacity-100",
          sorted && "opacity-100"
        )}
        onClick={() => column.toggleSorting()}
        aria-label={`Toggle sorting by ${title}`}
      >
        {sorted === "asc" ? (
          <ArrowUp />
        ) : sorted === "desc" ? (
          <ArrowDown />
        ) : (
          <ArrowUpDown />
        )}
      </Button>
    </div>
  )
}
