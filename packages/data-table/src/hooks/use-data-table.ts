import {
  parseAsIndex,
  parseAsInteger,
  useQueryState,
  useQueryStates,
  UseQueryStatesKeysMap,
} from "nuqs"

import {
  ColumnFiltersState,
  functionalUpdate,
  getCoreRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table"

import { useCallback, useMemo } from "react"
import { parseAsColumnSort } from "@workspace/data-table/lib/parsers"
import { getColumnFilterParsers } from "../lib/column"

const PAGE_KEY = "page"
const PER_PAGE_KEY = "perPage"
const SORT_KEY = "sort"

type QueryKeys = Record<"page" | "perPage" | "sort", string>

type UseDataTableProps<TData> = Omit<
  TableOptions<TData>,
  "data" | "getCoreRowModel"
> & {
  data?: { results: TData[]; count: number }
  queryKeys?: Partial<QueryKeys>
  filterParsers?: UseQueryStatesKeysMap
}

export function useDataTable<TData extends { id: number }>({
  data,
  columns,
  initialState,
  queryKeys,
  filterParsers,
  ...props
}: UseDataTableProps<TData>) {
  const pageKey = queryKeys?.page ?? PAGE_KEY
  const perPageKey = queryKeys?.perPage ?? PER_PAGE_KEY
  const sortKey = queryKeys?.sort ?? SORT_KEY

  const [page, setPage] = useQueryState(pageKey, parseAsIndex.withDefault(1))
  const [perPage, setPerPage] = useQueryState(
    perPageKey,
    parseAsInteger.withDefault(initialState?.pagination?.pageSize ?? 10)
  )

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: page - 1, pageSize: perPage }),
    [page, perPage]
  )

  const onPaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const { pageIndex, pageSize } = functionalUpdate(updater, pagination)
      setPage(pageIndex + 1)
      setPerPage(pageSize)
    },
    [pagination, setPage, setPerPage]
  )

  const [columnSort, setColumnSort] = useQueryState(sortKey, parseAsColumnSort)

  const sorting = useMemo<SortingState>(
    () => (columnSort ? [columnSort] : []),
    [columnSort]
  )

  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const next = functionalUpdate(updater, sorting)
      setColumnSort(next[0] ?? null)
    },
    [setColumnSort, sorting]
  )

  const columnFilterParsers = useMemo(
    () => getColumnFilterParsers(columns),
    [columns]
  )
  const [filters, setFilters] = useQueryStates({
    ...columnFilterParsers,
    ...filterParsers,
  })

  const columnFilters = useMemo<ColumnFiltersState>(
    () =>
      Object.entries(filters).flatMap(([id, value]) =>
        value !== null ? [{ id, value }] : []
      ),
    [filters]
  )

  const onColumnFiltersChange = useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const next = functionalUpdate(updater, columnFilters)

      setFilters(
        Object.keys(filters).reduce<Record<string, unknown>>((acc, id) => {
          const filter = next.find((f) => f.id === id)
          acc[id] = filter?.value ?? null
          return acc
        }, {})
      )
    },
    [columnFilters, filters, setFilters]
  )

  return useReactTable({
    ...props,

    data: data?.results ?? [],
    columns,

    getCoreRowModel: getCoreRowModel(),

    getRowId: (item) => item.id.toString(),
    rowCount: data?.count,

    initialState,
    state: { pagination, sorting, columnFilters },

    manualPagination: true,
    onPaginationChange,

    manualSorting: true,
    onSortingChange,

    manualFiltering: true,
    onColumnFiltersChange,
  })
}
