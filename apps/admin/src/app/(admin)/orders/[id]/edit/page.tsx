"use client"
import {
  AppHeader,
  AppHeaderContent,
  AppHeaderSeparator,
  AppHeaderSidebarTrigger,
} from "@/components/app-header"
import { NavBreadcrumb } from "@/components/nav-breadcrumb"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ordersRetrieveOptions } from "@workspace/api-client/query"
import { useParams } from "next/navigation"

export default function EditOrderPage() {
  const params = useParams<{ id: string }>()
  const { data: order } = useSuspenseQuery(
    ordersRetrieveOptions({ path: { id: Number(params.id) } })
  )

  return (
    <>
      <AppHeader>
        <AppHeaderContent>
          <AppHeaderSidebarTrigger />
          <AppHeaderSeparator />
          <NavBreadcrumb
            items={[
              { type: "link", label: "Orders", href: "/orders" },
              { type: "page", label: order.id.toString() },
            ]}
          />
        </AppHeaderContent>
      </AppHeader>
    </>
  )
}
