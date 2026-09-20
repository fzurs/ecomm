import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { CreateOrderForm } from "../form"
import React from "react"

export default function OrdersCreatePage() {
  return (
    <>
      <AppHeader>
        <AppHeaderNav
          items={[
            { type: "link", label: "Orders", href: "/orders" },
            { type: "page", label: "New" },
          ]}
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col">
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
          <div className="typeset">
            <h1>Create order</h1>
          </div>
          <CreateOrderForm />
        </div>
      </main>
    </>
  )
}
