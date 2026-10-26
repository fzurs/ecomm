import { useMemo } from "react"
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { CategoriesListData } from "@workspace/api-client"
import {
  categoriesListOptions,
  categoriesListQueryKey,
} from "@workspace/api-client/query"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { DataTable } from "@workspace/data-table/components/data-table"
import { DataTableAdvancedToolbar } from "@workspace/data-table/components/data-table-advanced-toolbar"
import { SearchInput } from "@/components/search-input"
import { useDebounce } from "@/hooks/use-debounce"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"
import { useSearch } from "@/hooks/use-search"
import { categoryColumns } from "./category-columns"

const DEBOUNCE_DELAY = 300

export function CategoriesTable() {
  const queryClient = useQueryClient()

  const pagination = usePagination()
  const ordering = useOrdering()
  const [search, setSearch] = useSearch()

  const queryFilters = useMemo<CategoriesListData["query"]>(
    () => ({ ordering, search }),
    [search, ordering]
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

  const table = useDataTable({ data, columns: categoryColumns })

  return (
    <DataTable
      table={table}
      onClearFilters={search ? () => setSearch("") : undefined}
    >
      <DataTableAdvancedToolbar table={table}>
        <SearchInput
          className="w-64"
          value={search}
          onValueChange={setSearch}
          count={data?.count}
          placeholder="Search categories..."
        />
      </DataTableAdvancedToolbar>
    </DataTable>
  )
}
