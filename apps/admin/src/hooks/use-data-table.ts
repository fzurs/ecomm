import {
  getCoreRowModel,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table"
import { useColumnFilters } from "./use-column-filters"
import { usePagination } from "./use-pagination"
import { useSorting } from "./use-sorting"

export function useDataTable<TData>({
  data: { results: data, count } = { results: [], count: 0 },
  columns,
  ...options
}: Omit<TableOptions<TData>, "getCoreRowModel" | "data"> & {
  data?: { results: TData[]; count: number }
}) {
  const { pagination, onPaginationChange } = usePagination()
  const { columnFilters, onColumnFiltersChange } = useColumnFilters(columns)
  const { sorting, onSortingChange } = useSorting()

  return useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: Math.ceil(count / pagination.pageSize),
    state: { pagination, columnFilters, sorting },
    onPaginationChange,
    onColumnFiltersChange,
    onSortingChange,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    defaultColumn: {
      enableColumnFilter: false,
      enableSorting: false,
    },
    ...options,
  })
}
