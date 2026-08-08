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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { UserPlusIcon } from "lucide-react"

export default function CustomersLayout({
  children,
}: LayoutProps<"/customers">) {
  return (
    <>
      <AppHeader>
        <AppHeaderNav items={[{ type: "page", label: "Customers" }]} />
        <AppHeaderActions>
          <CreateCustomerDialog />
        </AppHeaderActions>
      </AppHeader>
      {children}
    </>
  )
}

function CreateCustomerDialog() {
  const form = useCustomerForm()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlusIcon />
          New
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Customer</DialogTitle>
        </DialogHeader>
        <CustomerForm form={form} variant="required" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <form.AppForm>
            <form.Submit>Save</form.Submit>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
