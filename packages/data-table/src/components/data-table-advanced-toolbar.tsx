import { Table } from "@tanstack/react-table"
import { cn } from "@workspace/ui/lib/utils"
import { DataTableViewOptions } from "./data-table-view-options"

export function DataTableAdvancedToolbar<TData>({
  table,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  table: Table<TData>
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
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
