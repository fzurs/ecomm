import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ShippingZonesListData } from "@workspace/api-client"
import { shippingZonesListOptions } from "@workspace/api-client/query"
import { DataTable } from "@workspace/data-table/components/data-table"
import { DataTableAdvancedToolbar } from "@workspace/data-table/components/data-table-advanced-toolbar"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { useMemo } from "react"
import { SearchInput } from "@/components/search-input"
import { useDebounce } from "@/hooks/use-debounce"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"
import { useSearch } from "@/hooks/use-search"
import { shippingZoneColumns } from "./shipping-zone-columns"

export function ShippingZonesTable() {
  const ordering = useOrdering()
  const pagination = usePagination()
  const [search, setSearch] = useSearch()

  const debouncedSearch = useDebounce(search, 300)

  const queryFilters = useMemo<ShippingZonesListData["query"]>(
    () => ({
      ...pagination,
      ordering,
      search: debouncedSearch || undefined,
    }),
    [pagination, ordering, debouncedSearch]
  )

  const { data } = useQuery({
    ...shippingZonesListOptions({ query: queryFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({ data, columns: shippingZoneColumns })

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
          placeholder="Search zones..."
        />
      </DataTableAdvancedToolbar>
    </DataTable>
  )
}
