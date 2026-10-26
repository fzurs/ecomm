import { useMemo } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { BrandsListData } from "@workspace/api-client"
import { brandsListOptions } from "@workspace/api-client/query"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { DataTable } from "@workspace/data-table/components/data-table"
import { DataTableAdvancedToolbar } from "@workspace/data-table/components/data-table-advanced-toolbar"
import { SearchInput } from "@/components/search-input"
import { useDebounce } from "@/hooks/use-debounce"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"
import { useSearch } from "@/hooks/use-search"
import { brandColumns } from "./brand-columns"

export function BrandsTable() {
  const ordering = useOrdering()
  const pagination = usePagination()
  const [search, setSearch] = useSearch()

  const debouncedSearch = useDebounce(search, 300)

  const queryFilters = useMemo<BrandsListData["query"]>(
    () => ({
      ...pagination,
      ordering,
      search: debouncedSearch || undefined,
    }),
    [pagination, ordering, debouncedSearch]
  )

  const { data } = useQuery({
    ...brandsListOptions({ query: queryFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({ data, columns: brandColumns })

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
          placeholder="Search brands..."
        />
      </DataTableAdvancedToolbar>
    </DataTable>
  )
}
