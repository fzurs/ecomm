import {
  TableOptions,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useColumnFiltersSearchParams } from "@/lib/search-params.column-filters";
import { useGlobalFilterSearchParams } from "@/lib/search-params.global-filter";
import { usePaginationSearchParams } from "@/lib/search-params.pagination";
import { useSortingSearchParams } from "@/lib/search-params.sorting";

export function useDataTable<TData>({
  data = { results: [], count: 0 },
  onColumnFiltersChange,
  state,
  ...options
}: Omit<TableOptions<TData>, "getCoreRowModel" | "data"> & {
  data?: { results: TData[]; count: number };
}) {
  const [pagination, setPagination] = usePaginationSearchParams();
  const [sorting, setSorting] = useSortingSearchParams();
  const [columnFilters, setColumnFilters] = useColumnFiltersSearchParams();
  const [globalFilter, setGlobalFilter] = useGlobalFilterSearchParams();

  return useReactTable({
    data: data?.results ?? [],
    state: { pagination, sorting, columnFilters, globalFilter, ...state },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: (updaterOrValue) => {
      setPagination({ pageIndex: 0 });
      setColumnFilters(updaterOrValue);
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    manualPagination: true,
    manualFiltering: true,
    pageCount: Math.ceil(data.count / pagination.pageSize),
    ...options,
  });
}
