import { flexRender, type Table as TanstackTable } from "@tanstack/react-table"
import * as React from "react"

import { DataTablePagination } from "./data-table-pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { DataTableToolbar } from "./data-table-toolbar"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export function DataTable<TData>({
  table,
  children,
  showToolbar = true,
}: {
  table: TanstackTable<TData>
  children?: React.ReactNode
  showToolbar?: boolean
}) {
  return (
    <div className="flex w-full flex-col justify-start gap-6">
      {children ?? (showToolbar && <DataTableToolbar table={table} />)}
      <div className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader className="bg-secondary">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "text-xs uppercase",
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.className}
                      >
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
                    className="h-92"
                  >
                    <div className="flex flex-col items-center justify-center gap-4">
                      <span className="text-lg text-muted-foreground">
                        No results.
                      </span>
                      {table.getState().columnFilters.length > 0 && (
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => table.resetColumnFilters()}
                        >
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
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
