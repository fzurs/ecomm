import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { customerColumns } from "./customer-columns"
import { parseAsString, useQueryState } from "nuqs"
import { useMemo } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { customersListOptions } from "@workspace/api-client/query"
import { DataTable } from "@workspace/data-table/components/data-table"
import { DataTableToolbar } from "@workspace/data-table/components/data-table-toolbar"
import { SearchInput } from "@/components/search-input"
import { CustomersListData } from "@workspace/api-client"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"

export function CustomersTable() {
  const ordering = useOrdering()
  const pagination = usePagination()

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  )
  const debouncedSearch = useDebounce(search, 300)

  const queryFilters = useMemo<CustomersListData["query"]>(
    () => ({ ...pagination, ...ordering, debouncedSearch }),
    [pagination, ordering, debouncedSearch]
  )

  const { data } = useQuery({
    ...customersListOptions({ query: queryFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({ data, columns: customerColumns })

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <SearchInput
          value={search}
          onValueChange={setSearch}
          count={data?.count}
          placeholder="Search for a customers..."
        />
      </DataTableToolbar>
    </DataTable>
  )
}
