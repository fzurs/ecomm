"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
} from "@/components/app-header"
import { RowActionsProvider } from "@/context/row-actions-provider"

import {
  BrandCreateForm,
  useBrandCreateForm,
} from "./_components/brand-create-form"
import { BrandsTable } from "./_components/brands-table"
import { BrandEditDrawer } from "./_components/brand-edit-drawer"
import { BrandDeleteAlertDialog } from "./_components/brand-delete-alert-dialog"

export default function BrandsPage() {
  return (
    <RowActionsProvider>
      <AppHeader>
        <AppHeaderNav page="Brands" />
        <AppHeaderActions>
          <CreateBrandDialog />
        </AppHeaderActions>
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <BrandsTable />
        <BrandEditDrawer />
        <BrandDeleteAlertDialog />
      </main>
    </RowActionsProvider>
  )
}

function CreateBrandDialog() {
  const [open, setOpen] = useState(false)

  const form = useBrandCreateForm({ onSuccess: () => setOpen(false) })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon />
        Add New
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Brand</DialogTitle>
        </DialogHeader>
        <BrandCreateForm form={form} />
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
