"use client"
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
} from "@/components/app-header"
import {
  CustomerCreateForm,
  useCustomerCreateForm,
} from "./_components/customer-create-form"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { UserPlusIcon } from "lucide-react"
import { useState } from "react"

import { CustomersTable } from "./_components/customers-table"
import { CustomerEditDrawer } from "./_components/customer-edit-drawer"
import { CustomerDeleteAlertDialog } from "./_components/customer-delete-alert-dialog"
import { CustomerViewDrawer } from "./_components/customer-view-drawer"
import { RowActionsProvider } from "@/context/row-actions-provider"

export default function CustomersPage() {
  return (
    <RowActionsProvider>
      <AppHeader>
        <AppHeaderNav page="Customers" />
        <AppHeaderActions>
          <CreateCustomerDialog />
        </AppHeaderActions>
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <CustomersTable />
        <CustomerViewDrawer />
        <CustomerEditDrawer />
        <CustomerDeleteAlertDialog />
      </main>
    </RowActionsProvider>
  )
}

function CreateCustomerDialog() {
  const [open, setOpen] = useState(false)

  const form = useCustomerCreateForm({ onSuccess: () => setOpen(false) })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <UserPlusIcon />
        New
      </DialogTrigger>
      <DialogContent
        onAnimationEnd={(e) => {
          if (!open && e.animationName === "exit") {
            form.reset()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Create customer</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new customer.
          </DialogDescription>
        </DialogHeader>
        <CustomerCreateForm form={form} />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          <form.AppForm>
            <form.SubmitButton>Create</form.SubmitButton>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
