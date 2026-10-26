import { parseAsIndex, parseAsInteger, useQueryState } from "nuqs"

import {
  functionalUpdate,
  getCoreRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table"

import { useCallback, useEffect, useMemo } from "react"
import { parseAsColumnSort } from "@workspace/data-table/lib/parsers"

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
}

export function useDataTable<TData extends { id: number }>({
  data,
  columns,
  initialState,
  queryKeys,
  ...props
}: UseDataTableProps<TData>) {
  const pageKey = queryKeys?.page ?? PAGE_KEY
  const perPageKey = queryKeys?.perPage ?? PER_PAGE_KEY
  const sortKey = queryKeys?.sort ?? SORT_KEY

  const [pageIndex, setPageIndex] = useQueryState(
    pageKey,
    parseAsIndex.withDefault(0)
  )
  const [perPage, setPerPage] = useQueryState(
    perPageKey,
    parseAsInteger.withDefault(initialState?.pagination?.pageSize ?? 10)
  )

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex, pageSize: perPage }),
    [pageIndex, perPage]
  )

  const onPaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const next = functionalUpdate(updater, pagination)
      setPageIndex(next.pageIndex)
      setPerPage(next.pageSize)
    },
    [pagination, setPageIndex, setPerPage]
  )

  // Deleting the last rows, or an old link, can leave the URL past the last
  // page: go back to the last page that has results.
  useEffect(() => {
    if (!data) return
    const lastPageIndex = Math.max(Math.ceil(data.count / perPage) - 1, 0)
    if (pageIndex > lastPageIndex) setPageIndex(lastPageIndex)
  }, [data, pageIndex, perPage, setPageIndex])

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

  return useReactTable({
    ...props,

    data: data?.results ?? [],
    columns,

    getCoreRowModel: getCoreRowModel(),

    getRowId: (item) => item.id.toString(),
    rowCount: data?.count,

    initialState,
    state: { pagination, sorting },

    manualPagination: true,
    onPaginationChange,

    manualSorting: true,
    onSortingChange,

    // Filters live outside the table (DataTableFilter, in the URL) and go to
    // the API: the table doesn't filter its rows.
    manualFiltering: true,
  })
}
