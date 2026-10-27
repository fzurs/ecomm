"use client"

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  ordersListOptions,
  ordersListQueryKey,
} from "@workspace/api-client/query"
import { orderColumns } from "./_components/order-columns"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
} from "@/components/app-header"
import { DataTable } from "@workspace/data-table/components/data-table"
import { buttonVariants } from "@workspace/ui/components/button"
import Link from "next/link"
import { useMemo } from "react"
import { PlusIcon } from "lucide-react"
import { OrdersListData } from "@workspace/api-client"
import { useDebounce } from "@/hooks/use-debounce"
import { useFiltersState } from "@/hooks/use-filters-state"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"
import { DataTableAdvancedToolbar } from "@workspace/data-table/components/data-table-advanced-toolbar"
import {
  DataTableFilter,
  toQueryParams,
  useDataTableFilters,
} from "@workspace/data-table/filters"
import { SearchInput } from "@/components/search-input"
import { useSearch } from "@/hooks/use-search"
import { RowActionsProvider } from "@/context/row-actions-provider"
import { OrderDeleteAlertDialog } from "./_components/order-delete-alert-dialog"
import { OrderInvoiceRowDialog } from "./_components/order-invoice-dialog"
import { OrderViewDrawer } from "./_components/order-view-drawer"
import { useOrderFilterOptions } from "./_hooks/use-order-filter-options"
import { orderFilterColumns } from "./_lib/order-filters"

const DEBOUNCE_DELAY = 300

export default function OrdersPage() {
  const queryClient = useQueryClient()

  const pagination = usePagination()
  const ordering = useOrdering()
  const [search, setSearch] = useSearch()
  const [filters, setFilters] = useFiltersState(orderFilterColumns)
  const filterOptions = useOrderFilterOptions()

  const queryFilters = useMemo<OrdersListData["query"]>(
    () => ({ ...toQueryParams(filters), ordering, search }),
    [filters, ordering, search]
  )

  const debouncedQueryFilters = useDebounce(queryFilters, DEBOUNCE_DELAY)

  const query = useMemo<OrdersListData["query"]>(
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
        ordersListQueryKey({ query: immediateQuery })
      ) !== undefined,
    [queryClient, immediateQuery]
  )

  const activeFilters = isCached ? immediateQuery : query

  const { data } = useQuery({
    ...ordersListOptions({ query: activeFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({
    data,
    columns: orderColumns,
  })

  const hasFilters = filters.length > 0 || search !== ""
  const clearFilters = () => {
    setFilters([])
    setSearch("")
  }

  const dataTableFilters = useDataTableFilters({
    strategy: "server",
    data: data?.results ?? [],
    columnsConfig: orderFilterColumns,
    filters,
    onFiltersChange: setFilters,
    options: filterOptions,
  })

  return (
    <RowActionsProvider>
      <AppHeader>
        <AppHeaderNav page="Orders" />
        <AppHeaderActions>
          <Link href="/orders/new" className={buttonVariants({ size: "sm" })}>
            <PlusIcon />
            Create
          </Link>
        </AppHeaderActions>
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
              placeholder="Search orders..."
            />
            <DataTableFilter {...dataTableFilters} />
          </DataTableAdvancedToolbar>
        </DataTable>
        <OrderViewDrawer />
        <OrderDeleteAlertDialog />
        <OrderInvoiceRowDialog />
      </main>
    </RowActionsProvider>
  )
}
