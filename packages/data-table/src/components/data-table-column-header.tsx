"use client"

import type { Column, RowData } from "@tanstack/react-table"
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
import { cn } from "cn"
import { ArrowDown, ArrowUp, ArrowUpDown, EyeOffIcon } from "lucide-react"
import type { ColumnAlign, DataTableFeatures } from "../types/data-table"

// The negative margin cancels the button's padding, so the title lines up with
// the cells' content. Right-aligned, the sort icon goes first to keep the title
// flush with the numbers below.
const triggerAlignClasses: Record<ColumnAlign, string> = {
  left: "-ml-2",
  center: "",
  right: "-mr-2 flex-row-reverse",
}

const menuAlign = { left: "start", center: "center", right: "end" } as const

// The header opens a menu to sort and hide the column. The sort icon shows on
// hover of the header cell (`group/th`, set by DataTable), on keyboard focus,
// while the menu is open, and always while the column is sorted.
export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  align = "left",
}: {
  column: Column<DataTableFeatures, TData, TValue>
  title?: string
  align?: ColumnAlign
}) {
  const canSort = column.getCanSort()
  const canHide = column.getCanHide()
  const sorted = column.getIsSorted()

  if (!canSort && !canHide) return title

  const SortIcon =
    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown

  // Choosing the current direction again clears the sorting.
  const onSort = (desc: boolean) => {
    if (sorted === (desc ? "desc" : "asc")) column.clearSorting()
    else column.toggleSorting(desc)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "group/header px-2 text-muted-foreground data-popup-open:bg-muted",
              triggerAlignClasses[align]
            )}
          />
        }
      >
        {title}
        {canSort && (
          <SortIcon
            className={cn(
              "opacity-0 group-hover/th:opacity-100 group-focus-visible/header:opacity-100 group-data-popup-open/header:opacity-100",
              sorted && "opacity-100"
            )}
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={menuAlign[align]} className="min-w-32">
        {canSort && (
          <DropdownMenuGroup>
            <DropdownMenuCheckboxItem
              checked={sorted === "asc"}
              onClick={() => onSort(false)}
              closeOnClick
            >
              <ArrowUp className="text-muted-foreground" />
              Asc
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sorted === "desc"}
              onClick={() => onSort(true)}
              closeOnClick
            >
              <ArrowDown className="text-muted-foreground" />
              Desc
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        )}
        {canSort && canHide && <DropdownMenuSeparator />}
        {canHide && (
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOffIcon className="text-muted-foreground" />
            Hide
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
