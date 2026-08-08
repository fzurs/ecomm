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
import { useState } from "react"

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
