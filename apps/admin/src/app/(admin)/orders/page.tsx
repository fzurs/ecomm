"use client"
import { DataTable } from "@/components/data-table/data-table"
import { useDataTable } from "@/hooks/use-data-table"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ordersListOptions } from "@workspace/api-client/query"
import { columns } from "./columns"
import { Button } from "@workspace/ui/components/button"
import { ClipboardPlus } from "lucide-react"
import Link from "next/link"
import { usePaginationValues } from "@/hooks/use-pagination"
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderContent,
  AppHeaderSeparator,
  AppHeaderSidebarTrigger,
} from "@/components/app-header"
import { NavBreadcrumb } from "@/components/nav-breadcrumb"
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/section"

export default function OrdersPage() {
  const pagination = usePaginationValues()

  const { data } = useQuery({
    ...ordersListOptions({ query: pagination }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({ data, columns })

  return (
    <>
      <AppHeader>
        <AppHeaderContent>
          <AppHeaderSidebarTrigger />
          <AppHeaderSeparator />
          <NavBreadcrumb items={[{ type: "page", label: "Orders" }]} />
        </AppHeaderContent>
        <AppHeaderActions>
          <Button size="sm" asChild>
            <Link href="/orders/new">
              <ClipboardPlus />
              New Order
            </Link>
          </Button>
        </AppHeaderActions>
      </AppHeader>
      <SectionGroup>
        <Section>
          <SectionHeader>
            <SectionTitle>Orders</SectionTitle>
            <SectionDescription>
              Browse all orders, track their status, and manage them.
            </SectionDescription>
          </SectionHeader>
          <SectionContent>
            <DataTable table={table} showToolbar={false} />
          </SectionContent>
        </Section>
      </SectionGroup>
    </>
  )
}
