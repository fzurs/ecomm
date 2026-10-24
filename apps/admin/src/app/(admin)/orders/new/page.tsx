"use client"

import { useRouter } from "next/navigation"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import {
  OrderCreateForm,
  useOrderCreateForm,
} from "../_components/order-create-form"

export default function OrdersCreatePage() {
  const router = useRouter()

  const form = useOrderCreateForm({ onSuccess: () => router.push("/orders") })

  return (
    <>
      <AppHeader>
        <AppHeaderNav
          parents={[{ label: "Orders", href: "/orders" }]}
          page="Create"
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col">
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
          <div className="typeset">
            <h1>Create order</h1>
          </div>
          <OrderCreateForm form={form} />
        </div>
      </main>
    </>
  )
}
