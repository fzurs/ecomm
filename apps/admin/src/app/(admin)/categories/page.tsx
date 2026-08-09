"use client"
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { columns } from "./columns"
import { useDebounce } from "@/hooks/use-debounce"
import {
  categoriesListOptions,
  categoriesListQueryKey,
} from "@workspace/api-client/query"
import { SectionGroup } from "@/components/section"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { useMemo } from "react"
import { CategoriesListData } from "@workspace/api-client"
import { DataTable } from "@workspace/data-table/components/data-table"
import { DataTableToolbar } from "@workspace/data-table/components/data-table-toolbar"
import { parseAsString, useQueryState } from "nuqs"
import { SearchInput } from "@/components/search-input"
import { usePagination } from "@/hooks/use-pagination"
import { useOrdering } from "@/hooks/use-ordering"
import { useFilters } from "@/hooks/use-filters"

const DEBOUNCE_DELAY = 300

export default function CategoriesPage() {
  const queryClient = useQueryClient()

  const pagination = usePagination()
  const ordering = useOrdering()
  const columnFilters = useFilters(columns)

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  )

  const queryFilters = useMemo<CategoriesListData["query"]>(
    () => ({ ...columnFilters, ...ordering, search }),
    [columnFilters, search, ordering]
  )

  const debouncedQueryFilters = useDebounce(queryFilters, DEBOUNCE_DELAY)

  const query = useMemo<CategoriesListData["query"]>(
    () => ({
      ...debouncedQueryFilters,
      ...pagination,
    }),
    [debouncedQueryFilters, pagination]
  )

  const immediateQuery = useMemo(
    () => ({
      ...queryFilters,
      ...pagination,
    }),
    [queryFilters, pagination]
  )

  const isCached = useMemo(
    () =>
      queryClient.getQueryData(
        categoriesListQueryKey({ query: immediateQuery })
      ) !== undefined,
    [queryClient, immediateQuery]
  )

  const activeFilters = isCached ? immediateQuery : query

  const { data } = useQuery({
    ...categoriesListOptions({ query: activeFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({ data, columns })

  return (
    <SectionGroup>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <SearchInput
            value={search}
            onValueChange={setSearch}
            count={data?.count}
            placeholder="Search for a categories..."
          />
        </DataTableToolbar>
      </DataTable>
    </SectionGroup>
  )
}
