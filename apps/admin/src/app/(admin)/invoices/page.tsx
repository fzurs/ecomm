"use client"

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  invoicesListOptions,
  invoicesListQueryKey,
} from "@workspace/api-client/query"
import { InvoicesListData } from "@workspace/api-client"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { DataTable } from "@workspace/data-table/components/data-table"
import { DataTableAdvancedToolbar } from "@workspace/data-table/components/data-table-advanced-toolbar"
import {
  DataTableFilter,
  toQueryParams,
  useDataTableFilters,
} from "@workspace/data-table/filters"
import { useMemo } from "react"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { SearchInput } from "@/components/search-input"
import { RowActionsProvider } from "@/context/row-actions-provider"
import { useDebounce } from "@/hooks/use-debounce"
import { useFiltersState } from "@/hooks/use-filters-state"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"
import { useSearch } from "@/hooks/use-search"
// The same customer options as the orders filter.
import { useOrderFilterOptions } from "../orders/_hooks/use-order-filter-options"
import { invoiceColumns } from "./_components/invoice-columns"
import { InvoiceDeleteAlertDialog } from "./_components/invoice-delete-alert-dialog"
import { InvoiceViewDrawer } from "./_components/invoice-view-drawer"
import { invoiceFilterColumns } from "./_lib/invoice-filters"

const DEBOUNCE_DELAY = 300

// Invoices are created from a paid order (its row actions), and notes from an
// authorized invoice: there is no create button here.
export default function InvoicesPage() {
  const queryClient = useQueryClient()

  const pagination = usePagination()
  const ordering = useOrdering()
  const [search, setSearch] = useSearch()
  const [filters, setFilters] = useFiltersState(invoiceFilterColumns)
  const filterOptions = useOrderFilterOptions()

  const queryFilters = useMemo<InvoicesListData["query"]>(
    () => ({ ...toQueryParams(filters), ordering, search }),
    [filters, ordering, search]
  )

  const debouncedQueryFilters = useDebounce(queryFilters, DEBOUNCE_DELAY)

  const query = useMemo<InvoicesListData["query"]>(
    () => ({ ...debouncedQueryFilters, ...pagination }),
    [debouncedQueryFilters, pagination]
  )

  const immediateQuery = useMemo(
    () => ({ ...queryFilters, ...pagination }),
    [queryFilters, pagination]
  )

  const isCached = useMemo(
    () =>
      queryClient.getQueryData(
        invoicesListQueryKey({ query: immediateQuery })
      ) !== undefined,
    [queryClient, immediateQuery]
  )

  const activeFilters = isCached ? immediateQuery : query

  const { data } = useQuery({
    ...invoicesListOptions({ query: activeFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({ data, columns: invoiceColumns })

  const hasFilters = filters.length > 0 || search !== ""
  const clearFilters = () => {
    setFilters([])
    setSearch("")
  }

  const dataTableFilters = useDataTableFilters({
    strategy: "server",
    data: data?.results ?? [],
    columnsConfig: invoiceFilterColumns,
    filters,
    onFiltersChange: setFilters,
    options: filterOptions,
  })

  return (
    <RowActionsProvider>
      <AppHeader>
        <AppHeaderNav page="Invoices" />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
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
              placeholder="Search invoices..."
            />
            <DataTableFilter {...dataTableFilters} />
          </DataTableAdvancedToolbar>
        </DataTable>
        <InvoiceViewDrawer />
        <InvoiceDeleteAlertDialog />
      </main>
    </RowActionsProvider>
  )
}
