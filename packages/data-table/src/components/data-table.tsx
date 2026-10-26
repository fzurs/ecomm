import { flexRender, type RowData } from "@tanstack/react-table"

import { DataTablePagination } from "./data-table-pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { cn } from "cn"
import { getColumnLabel } from "@workspace/data-table/lib/column"
import type { ColumnAlign, DataTableInstance } from "../types/data-table"
import { DataTableColumnHeader } from "./data-table-column-header"

const alignClasses: Record<ColumnAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

const ariaSort = {
  asc: "ascending",
  desc: "descending",
} as const

/** `onClearFilters` shows a "Clear filters" button when there are no results. */
export function DataTable<TData extends RowData>({
  table,
  children,
  onClearFilters,
}: {
  table: DataTableInstance<TData>
  children?: React.ReactNode
  onClearFilters?: () => void
}) {
  return (
    <div className="flex w-full flex-col justify-start gap-6">
      {children}
      <div className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const { column } = header
                    const align = column.columnDef.meta?.align ?? "left"
                    const sorted = column.getIsSorted()
                    return (
                      <TableHead
                        key={header.id}
                        aria-sort={
                          column.getCanSort()
                            ? sorted
                              ? ariaSort[sorted]
                              : "none"
                            : undefined
                        }
                        className={cn(
                          "group/th text-muted-foreground",
                          alignClasses[align]
                        )}
                      >
                        {header.isPlaceholder ? null : column.getCanSort() ||
                          column.getCanHide() ? (
                          <DataTableColumnHeader
                            column={column}
                            title={getColumnLabel(column)}
                            align={align}
                          />
                        ) : (
                          flexRender(
                            column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          alignClasses[
                            cell.column.columnDef.meta?.align ?? "left"
                          ],
                          cell.column.columnDef.meta?.className
                        )}
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
                      {onClearFilters && (
                        <Button
                          size="sm"
                          variant="link"
                          onClick={onClearFilters}
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
