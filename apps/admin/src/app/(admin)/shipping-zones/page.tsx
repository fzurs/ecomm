"use client"

import { Button } from "@workspace/ui/components/button"
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
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
} from "@/components/app-header"
import { RowActionsProvider } from "@/context/row-actions-provider"
import { useShippingZoneCreateForm } from "./_components/shipping-zone-create-form"
import { ShippingZoneDeleteAlertDialog } from "./_components/shipping-zone-delete-alert-dialog"
import { ShippingZoneEditDrawer } from "./_components/shipping-zone-edit-drawer"
import { ShippingZoneFields } from "./_components/shipping-zone-fields"
import { ShippingZonesTable } from "./_components/shipping-zones-table"

export default function ShippingZonesPage() {
  return (
    <RowActionsProvider>
      <AppHeader>
        <AppHeaderNav page="Shipping zones" />
        <AppHeaderActions>
          <CreateShippingZoneDialog />
        </AppHeaderActions>
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <ShippingZonesTable />
        <ShippingZoneEditDrawer />
        <ShippingZoneDeleteAlertDialog />
      </main>
    </RowActionsProvider>
  )
}

function CreateShippingZoneDialog() {
  const [open, setOpen] = useState(false)

  const form = useShippingZoneCreateForm({ onSuccess: () => setOpen(false) })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon />
        Create
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create shipping zone</DialogTitle>
          <DialogDescription>
            What sending an order to its provinces costs.
          </DialogDescription>
        </DialogHeader>
        <ShippingZoneFields form={form} />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <form.AppForm>
            <form.SubmitButton>Save</form.SubmitButton>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
