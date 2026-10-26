import type { RowData } from "@tanstack/react-table"
import { cn } from "cn"
import type { DataTableInstance } from "../types/data-table"
import { DataTableViewOptions } from "./data-table-view-options"

/**
 * Two sections: `children` on the left (search and filters, wrapping when they
 * don't fit) and `actions` on the right (sort, layout...), before the view
 * options. The actions stay on the first line when the filters wrap. Controls
 * go at the height of the `size="sm"` buttons (h-8).
 */
export function DataTableAdvancedToolbar<TData extends RowData>({
  table,
  className,
  children,
  actions,
  ...props
}: React.ComponentProps<"div"> & {
  table: DataTableInstance<TData>
  actions?: React.ReactNode
}) {
  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn("flex items-start justify-between gap-2", className)}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
