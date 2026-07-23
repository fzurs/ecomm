import { flexRender, type Table as TanstackTable } from "@tanstack/react-table"
import * as React from "react"

import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTableColumnHeader } from "./data-table-column-header"
import { Button } from "@workspace/ui/components/button"

export function DataTable<TData>({
  table,
  className,
  children,
  showToolbar = true,
  showPagination = true,
}: {
  className?: string
  table: TanstackTable<TData>
  children?: React.ReactNode
  showToolbar?: boolean
  showPagination?: boolean
}) {
  const hasChildren = React.Children.count(children) > 0
  const isFiltered = table.getState().columnFilters.length > 0
  const clearFilters = () => table.resetColumnFilters()

  return (
    <div
      className={cn(
        "flex w-full flex-col justify-start gap-6",
        className
      )}
    >
      {hasChildren
        ? children
        : showToolbar && <DataTableToolbar table={table} />}
      <div className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : typeof header.column
                          .columnDef.header === "function" ? (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      ) : (
                        <DataTableColumnHeader
                          title={
                            header.column.columnDef.header || header.column.id
                          }
                          column={header.column}
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-40"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      No results.
                      {isFiltered && (
                        <Button variant="link" size="sm" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {showPagination && <DataTablePagination table={table} />}
      </div>
    </div>
  )
}
