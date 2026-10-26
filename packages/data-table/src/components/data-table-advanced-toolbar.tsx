import { Table } from "@tanstack/react-table"
import { cn } from "cn"
import { DataTableViewOptions } from "./data-table-view-options"

/**
 * Two sections at the height of the `size="sm"` buttons (h-8): `children` on
 * the left (search and filters, wrapping when they don't fit) and `actions` on
 * the right (sort, layout...), before the view options. The actions stay on the
 * first line when the filters wrap.
 */
export function DataTableAdvancedToolbar<TData>({
  table,
  className,
  children,
  actions,
  ...props
}: React.ComponentProps<"div"> & {
  table: Table<TData>
  actions?: React.ReactNode
}) {
  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn("flex items-start justify-between gap-2", className)}
      {...props}
    >
      <div className="flex min-h-8 flex-1 flex-wrap items-center gap-2">
        {children}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
