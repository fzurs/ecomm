import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { customerColumns } from "./customer-columns"
import { useMemo } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { useSearch } from "@/hooks/use-search"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { customersListOptions } from "@workspace/api-client/query"
import { DataTable } from "@workspace/data-table/components/data-table"
import { SearchInput } from "@/components/search-input"
import { CustomersListData } from "@workspace/api-client"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"
import { DataTableAdvancedToolbar } from "@workspace/data-table/components/data-table-advanced-toolbar"

export function CustomersTable() {
  const ordering = useOrdering()
  const pagination = usePagination()

  const [search, setSearch] = useSearch()
  const debouncedSearch = useDebounce(search, 300)

  const queryFilters = useMemo<CustomersListData["query"]>(
    () => ({ ...pagination, ordering, search: debouncedSearch }),
    [pagination, ordering, debouncedSearch]
  )

  const { data } = useQuery({
    ...customersListOptions({ query: queryFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({
    data,
    columns: customerColumns,
    // Hidden: what the list isn't scanned for. The view options show them,
    // and the details have them all.
    initialState: {
      columnVisibility: { legal_name: false, phone: false, address: false },
    },
  })

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
          placeholder="Search by name, email, CUIT..."
        />
      </DataTableAdvancedToolbar>
    </DataTable>
  )
}
