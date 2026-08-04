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
import { parseAsArrayOf, parseAsStringEnum } from "nuqs"
import { columns } from "./columns"
import {
  useDataTable,
  useFilters,
  usePagination,
  useSorting,
} from "@workspace/data-table"
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

const DEBOUNCE_DELAY = 300

export default function OrdersPage() {
  const queryClient = useQueryClient()

  const pagination = usePagination()
  const sorting = useSorting()
  const columnFilters = useFilters(columns, {
    status: parseAsArrayOf(parseAsStringEnum(zOrderStatus.options)),
  })

  const queryFilters = useMemo<OrdersListData["query"]>(
    () => ({ ...columnFilters, ...sorting, search: columnFilters.customer }),
    [columnFilters, sorting]
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

  const table = useDataTable({ data, columns })

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
        <DataTable table={table} />
      </SectionGroup>
    </>
  )
}
