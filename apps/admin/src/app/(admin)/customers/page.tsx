"use client"
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
} from "@/components/app-header"
import { CustomerForm, useCustomerForm } from "./_components/customer-form"
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
        <AppHeaderNav items={[{ type: "page", label: "Customers" }]} />
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

  const form = useCustomerForm({ setOpen })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlusIcon />
          New
        </Button>
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
        <CustomerForm form={form} variant="required" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <form.AppForm>
            <form.SubmitButton>Save</form.SubmitButton>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
