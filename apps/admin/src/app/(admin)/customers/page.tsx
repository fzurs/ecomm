"use client"
import { SectionGroup } from "@/components/section"
import { RowActionsProvider } from "./_components/customers-provider"
import { CustomersTable } from "./_components/customers-table"
import { CustomerEditDrawer } from "./_components/customer-edit-drawer"
import { CustomerDeleteAlertDialog } from "./_components/customer-delete-alert-dialog"

export default function CustomersPage() {
  return (
    <RowActionsProvider>
      <SectionGroup>
        <CustomersTable />
      </SectionGroup>
      <CustomerEditDrawer />
      <CustomerDeleteAlertDialog />
    </RowActionsProvider>
  )
}
