"use client"
import { DataTable } from "@/components/data-table/data-table"
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
} from "@/components/page-header"
import { useDataTable } from "@/hooks/use-data-table"
import { useQuery } from "@tanstack/react-query"
import { ordersListOptions } from "@workspace/api-client/query"
import { columns } from "./columns"
import { Button } from "@workspace/ui/components/button"
import { ClipboardPlus } from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
  const { data } = useQuery(ordersListOptions())

  const table = useDataTable({ data, columns })

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Orders</PageHeaderHeading>
        <PageHeaderActions>
          <Button size="sm" asChild>
            <Link href="/orders/new">
              <ClipboardPlus />
              Create New Order
            </Link>
          </Button>
        </PageHeaderActions>
      </PageHeader>
      <div className="py-4 md:py-6">
        <DataTable table={table} />
      </div>
    </>
  )
}
