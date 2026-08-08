import { useDataTable, usePagination, useSorting } from "@workspace/data-table"
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

export function CustomersTable() {
  const sorting = useSorting()
  const pagination = usePagination()

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  )
  const debouncedSearch = useDebounce(search, 300)

  const queryFilters = useMemo<CustomersListData["query"]>(
    () => ({ ...pagination, ...sorting, debouncedSearch }),
    [pagination, sorting, debouncedSearch]
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
