"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { customersRetrieveOptions } from "@workspace/api-client/query"
import { useParams } from "next/navigation"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { MailIcon } from "lucide-react"
import { CustomerEditDrawer } from "../_components/customer-edit-drawer"
import {
  CustomerBillingDetails,
  CustomerContactDetails,
} from "../_components/customer-details"
import { CustomerEditButton } from "../_components/customer-buttons"
import { RowActionsProvider } from "@/context/row-actions-provider"

export default function CustomerDetailsPage() {
  const params = useParams<{ id: string }>()
  const customerId = Number(params.id)
  const { data: customer } = useSuspenseQuery(
    customersRetrieveOptions({ path: { id: customerId } })
  )

  return (
    <RowActionsProvider>
      <AppHeader>
        <AppHeaderNav
          parents={[{ label: "Customers", href: "/customers" }]}
          page={customer.name}
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col">
        <div className="flex flex-col gap-8 px-4 py-6 lg:px-6">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                {customer.image && <AvatarImage src={customer.image} />}
                <AvatarFallback />
              </Avatar>
              <div className="typeset">
                <h1>{customer.name}</h1>
                {customer.email && (
                  <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                    <MailIcon className="size-4" />
                    {customer.email}
                  </p>
                )}
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <CustomerEditButton customer={customer} />
            </div>
          </div>
          {/* Details: the groups of the edit form */}
          <section className="flex flex-col gap-2">
            <div className="typeset">
              <h2>Contact</h2>
            </div>
            <CustomerContactDetails customer={customer} />
          </section>
          <section className="flex flex-col gap-2">
            <div className="typeset">
              <h2>Billing</h2>
            </div>
            <CustomerBillingDetails customer={customer} />
          </section>
        </div>
      </main>
      <CustomerEditDrawer />
    </RowActionsProvider>
  )
}
