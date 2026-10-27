import { useMemo } from "react"
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { ProductsListData } from "@workspace/api-client"
import {
  productsListOptions,
  productsListQueryKey,
} from "@workspace/api-client/query"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { DataTable } from "@workspace/data-table/components/data-table"
import { DataTableAdvancedToolbar } from "@workspace/data-table/components/data-table-advanced-toolbar"
import {
  DataTableFilter,
  toQueryParams,
  useDataTableFilters,
} from "@workspace/data-table/filters"
import { SearchInput } from "@/components/search-input"
import { useDebounce } from "@/hooks/use-debounce"
import { useFiltersState } from "@/hooks/use-filters-state"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"
import { useSearch } from "@/hooks/use-search"
import { useProductFilterOptions } from "../_hooks/use-product-filter-options"
import { productFilterColumns } from "../_lib/product-filters"
import { productColumns } from "./product-columns"

const DEBOUNCE_DELAY = 300

// Most products share the IVA rate (21%): its column is hidden, its filter isn't.
const columnVisibility = { sku: false, vat_rate: false, description: false }

export function ProductsTable() {
  const queryClient = useQueryClient()

  const pagination = usePagination()
  const ordering = useOrdering()
  const [search, setSearch] = useSearch()
  const [filters, setFilters] = useFiltersState(productFilterColumns)
  const filterOptions = useProductFilterOptions()

  const queryFilters = useMemo<ProductsListData["query"]>(
    () => ({ ...toQueryParams(filters), ordering, search }),
    [filters, ordering, search]
  )

  const debouncedQueryFilters = useDebounce(queryFilters, DEBOUNCE_DELAY)

  const query = useMemo<ProductsListData["query"]>(
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
        productsListQueryKey({ query: immediateQuery })
      ) !== undefined,
    [queryClient, immediateQuery]
  )

  const activeFilters = isCached ? immediateQuery : query

  const { data } = useQuery({
    ...productsListOptions({ query: activeFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({
    data,
    columns: productColumns,
    initialState: { columnVisibility },
  })

  const hasFilters = filters.length > 0 || search !== ""
  const clearFilters = () => {
    setFilters([])
    setSearch("")
  }

  const dataTableFilters = useDataTableFilters({
    strategy: "server",
    data: data?.results ?? [],
    columnsConfig: productFilterColumns,
    filters,
    onFiltersChange: setFilters,
    options: filterOptions,
  })

  return (
    <DataTable
      table={table}
      onClearFilters={hasFilters ? clearFilters : undefined}
    >
      <DataTableAdvancedToolbar table={table}>
        <SearchInput
          className="w-64"
          value={search}
          onValueChange={setSearch}
          count={data?.count}
          placeholder="Search products..."
        />
        <DataTableFilter {...dataTableFilters} />
      </DataTableAdvancedToolbar>
    </DataTable>
  )
}
