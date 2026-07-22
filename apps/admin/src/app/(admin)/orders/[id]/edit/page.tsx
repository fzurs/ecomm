"use client"
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
} from "@/components/page-header"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ordersRetrieveOptions } from "@workspace/api-client/query"
import { Button } from "@workspace/ui/components/button"
import { ChevronLeftIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function EditOrderPage() {
  const params = useParams<{ id: string }>()
  const { data: order } = useSuspenseQuery(
    ordersRetrieveOptions({ path: { id: Number(params.id) } })
  )

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Order: {order.id}</PageHeaderHeading>
        <PageHeaderActions>
          <Button size="sm" variant="ghost" asChild>
            <Link href="/orders">
              <ChevronLeftIcon />
              Orders
            </Link>
          </Button>
        </PageHeaderActions>
      </PageHeader>
    </>
  )
}
