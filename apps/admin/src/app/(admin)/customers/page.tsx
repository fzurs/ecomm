"use client"
import { RowActionsProvider } from "./_components/customer-provider"
import { CustomersTable } from "./_components/customers-table"
import { CustomerEditDrawer } from "./_components/customer-edit-drawer"
import { CustomerDeleteAlertDialog } from "./_components/customer-delete-alert-dialog"

export default function CustomersPage() {
  return (
    <RowActionsProvider>
      <CustomersTable />
      <CustomerEditDrawer />
      <CustomerDeleteAlertDialog />
    </RowActionsProvider>
  )
}
