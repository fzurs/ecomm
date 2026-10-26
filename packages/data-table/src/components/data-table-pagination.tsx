import type { RowData } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@workspace/ui/components/pagination"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "cn"
import { getPageItems } from "../lib/pagination"
import type { DataTableInstance } from "../types/data-table"

const numberFormat = new Intl.NumberFormat("en-US")

interface DataTablePaginationProps<
  TData extends RowData,
> extends React.ComponentProps<"div"> {
  table: DataTableInstance<TData>
  pageSizeOptions?: number[]
}

export function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.state.pagination
  const pageCount = Math.max(table.getPageCount(), 1)
  const rowCount = table.getRowCount()
  const from = rowCount ? pageIndex * pageSize + 1 : 0
  const to = Math.min((pageIndex + 1) * pageSize, rowCount)

  const goToPage = (value: string) => {
    const page = Number.parseInt(value, 10)
    if (Number.isNaN(page)) return
    table.setPageIndex(Math.min(Math.max(page, 1), pageCount) - 1)
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 @3xl/data-table:flex-row",
        className
      )}
      {...props}
    >
      <p className="text-sm whitespace-nowrap text-muted-foreground">
        {rowCount ? (
          <>
            Showing{" "}
            <span className="font-medium text-foreground">
              {numberFormat.format(from)}–{numberFormat.format(to)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {numberFormat.format(rowCount)}
            </span>
          </>
        ) : (
          "No results"
        )}
      </p>

      <div className="flex flex-col-reverse items-center gap-4 @xl/data-table:flex-row @xl/data-table:gap-6">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[4.5rem] [&[data-size]]:h-8">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectGroup>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={`${option}`}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                aria-label="Go to first page"
                variant="outline"
                size="icon-sm"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                aria-label="Go to previous page"
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft />
              </Button>
            </PaginationItem>

            {getPageItems(pageIndex, pageCount).map((item) =>
              typeof item === "number" ? (
                <PaginationItem
                  key={item}
                  className="hidden @2xl/data-table:block"
                >
                  <Button
                    aria-label={`Go to page ${item + 1}`}
                    aria-current={item === pageIndex ? "page" : undefined}
                    variant={item === pageIndex ? "outline" : "ghost"}
                    size="sm"
                    className="min-w-8 tabular-nums"
                    onClick={() => table.setPageIndex(item)}
                  >
                    {item + 1}
                  </Button>
                </PaginationItem>
              ) : (
                <PaginationItem
                  key={item}
                  className="hidden @2xl/data-table:block"
                >
                  <PaginationEllipsis className="size-8" />
                </PaginationItem>
              )
            )}
            <PaginationItem className="px-2 text-sm font-medium whitespace-nowrap @2xl/data-table:hidden">
              Page {pageIndex + 1} of {pageCount}
            </PaginationItem>

            <PaginationItem>
              <Button
                aria-label="Go to next page"
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                aria-label="Go to last page"
                variant="outline"
                size="icon-sm"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <label className="hidden items-center gap-2 text-sm font-medium whitespace-nowrap @xl/data-table:flex">
          Go to
          <Input
            // Remounting resets the typed value when the page changes elsewhere.
            key={pageIndex}
            type="number"
            inputMode="numeric"
            min={1}
            max={pageCount}
            defaultValue={pageIndex + 1}
            aria-label="Page number"
            className="h-8 w-16 tabular-nums"
            onKeyDown={(event) => {
              if (event.key === "Enter") goToPage(event.currentTarget.value)
            }}
            onBlur={(event) => goToPage(event.currentTarget.value)}
          />
        </label>
      </div>
    </div>
  )
}
