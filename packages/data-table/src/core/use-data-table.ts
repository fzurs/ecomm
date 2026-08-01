import { useMemo } from "react"

import { UseQueryStatesKeysMap } from "nuqs"

import {
  getCoreRowModel,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table"

import { useDataTablePagination } from "../pagination"
import { useDataTableColumnFilters } from "../filters/use-column-filters"
import { useDataTableSorting } from "../sorting"

type DataTableOptions<TData> = Omit<
  TableOptions<TData>,
  "getCoreRowModel" | "data" | "manualPagination"
> & {
  data?: { results: TData[]; count: number }
  filterParsers?: UseQueryStatesKeysMap
}

export function useDataTable<TData extends { id: number }>({
  data,
  columns,
  filterParsers,
  ...props
}: DataTableOptions<TData>) {
  const { pagination, onPaginationChange } = useDataTablePagination()

  const { sorting, onSortingChange } = useDataTableSorting()

  const { columnFilters, onColumnFiltersChange } = useDataTableColumnFilters(
    columns,
    filterParsers
  )

  const pageCount = useMemo(
    () => Math.ceil((data?.count ?? 0) / pagination.pageSize),
    [data?.count, pagination.pageSize]
  )

  return useReactTable({
    data: data?.results ?? [],
    columns,

    getCoreRowModel: getCoreRowModel(),
    getRowId: (item) => item.id.toString(),

    pageCount,
    manualPagination: true,

    state: { pagination, sorting, columnFilters },

    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,

    ...props,
  })
}
