"use client"

import { useQuery } from "@tanstack/react-query"
import { ordersListOptions } from "@workspace/api-client/query"
import { zOrderStatus } from "@workspace/api-client/zod"
import { parseAsArrayOf, parseAsStringEnum } from "nuqs"
import { columns } from "./columns"
import {
  useDataTable,
  useFilters,
  usePagination,
  useSorting,
} from "@workspace/data-table"
import { AppHeader, AppHeaderActions, AppHeaderNav } from "@/components/app-header"
import { SectionGroup } from "@/components/section"
import { DataTable } from "@workspace/data-table/components/data-table"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

const filterParsers = {
  status: parseAsArrayOf(parseAsStringEnum(zOrderStatus.options)),
}

export default function OrdersPage() {
  const pagination = usePagination()
  const sorting = useSorting()
  const filters = useFilters(columns, filterParsers)

  const { data } = useQuery(
    ordersListOptions({
      query: { ...pagination, ...sorting, ...filters },
    })
  )

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
