import { Table } from "@tanstack/react-table"
import { cn } from "cn"
import { DataTableViewOptions } from "./data-table-view-options"

/** `children` go on the left (filters); `actions` on the right, before the view options. */
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
      className={cn("flex items-end justify-between gap-2", className)}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      <div className="flex items-center gap-2">
        {actions}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
