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
import { zOrderStatus } from "@workspace/api-client/zod"
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs"
import { columns, statusOptions } from "./columns"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
} from "@/components/app-header"
import { SectionGroup } from "@/components/section"
import { DataTable } from "@workspace/data-table/components/data-table"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { useMemo } from "react"
import { OrdersListData } from "@workspace/api-client"
import { useDebounce } from "@/hooks/use-debounce"
import { useFilters } from "@/hooks/use-filters"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"
import { DataTableAdvancedToolbar } from "@workspace/data-table/components/data-table-advanced-toolbar"
import { SearchInput } from "@/components/search-input"
import { DataTableFacetedFilter } from "@workspace/data-table/components/data-table-faceted-filter"
import { DataTableSortMenu } from "@workspace/data-table/components/data-table-sort-menu"

const DEBOUNCE_DELAY = 300

export default function OrdersPage() {
  const queryClient = useQueryClient()

  const pagination = usePagination()
  const ordering = useOrdering()
  const columnFilters = useFilters(columns, {
    status: parseAsArrayOf(parseAsStringEnum(zOrderStatus.options)),
  })

  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""))

  const queryFilters = useMemo<OrdersListData["query"]>(
    () => ({ ...columnFilters, ordering, search }),
    [columnFilters, ordering, search]
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
    columns,
  })

  return (
    <>
      <AppHeader>
        <AppHeaderNav items={[{ type: "page", label: "Orders" }]} />
        <AppHeaderActions>
          <Button size="sm" asChild>
            <Link href="/orders/new">New Order</Link>
          </Button>
        </AppHeaderActions>
      </AppHeader>
      <SectionGroup>
        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <SearchInput
              className="flex min-w-64 flex-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
            />
            <DataTableFacetedFilter
              multiple
              column={table.getColumn("status")}
              options={statusOptions}
              title="Filter by Status"
            />
            <DataTableSortMenu table={table} />
          </DataTableAdvancedToolbar>
        </DataTable>
      </SectionGroup>
    </>
  )
}
