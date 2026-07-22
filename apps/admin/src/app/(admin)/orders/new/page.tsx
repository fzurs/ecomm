import {
  AppHeader,
  AppHeaderContent,
  AppHeaderSeparator,
  AppHeaderSidebarTrigger,
} from "@/components/app-header"
import { NavBreadcrumb } from "@/components/nav-breadcrumb"

import { CreateOrderForm } from "../form"

export default function OrdersCreatePage() {
  return (
    <>
      <AppHeader>
        <AppHeaderContent>
          <AppHeaderSidebarTrigger />
          <AppHeaderSeparator />
          <NavBreadcrumb
            items={[
              { type: "link", label: "Orders", href: "/orders" },
              { type: "page", label: "New" },
            ]}
          />
        </AppHeaderContent>
      </AppHeader>
      <div className="mx-auto w-full max-w-2xl p-6">
        <CreateOrderForm />
      </div>
    </>
  )
}
