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
import { CustomerDetails } from "../_components/customer-details"
import { CustomerEditButton } from "../_components/customer-buttons"

export default function CustomerDetailsPage() {
  const params = useParams<{ id: string }>()
  const customerId = Number(params.id)
  const { data: customer } = useSuspenseQuery(
    customersRetrieveOptions({ path: { id: customerId } })
  )

  return (
    <>
      <AppHeader>
        <AppHeaderNav
          items={[
            { label: "Customers", href: "/customers", type: "link" },
            { label: customer.name, type: "page" },
          ]}
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col">
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <Avatar className="size-24">
              {customer.image && <AvatarImage src={customer.image} />}
              <AvatarFallback />
            </Avatar>
            <div className="typeset">
              <h1>{customer.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                <MailIcon className="size-4" />
                {customer.email}
              </p>
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <CustomerEditButton customer={customer} />
          </div>
          {/* Details */}
          <section className="flex flex-col gap-4">
            <div className="typeset">
              <h2>Customer details</h2>
            </div>
            <CustomerDetails customer={customer} />
          </section>
        </div>
      </main>
      <CustomerEditDrawer />
    </>
  )
}
