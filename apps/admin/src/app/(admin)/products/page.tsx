"use client"

import { useState } from "react"
import { PackagePlus } from "lucide-react"

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
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
} from "@/components/app-header"
import { RowActionsProvider } from "@/context/row-actions-provider"

import {
  ProductCreateForm,
  useProductCreateForm,
} from "./_components/product-create-form"
import { ProductsTable } from "./_components/products-table"
import { ProductEditDrawer } from "./_components/product-edit-drawer"
import { ProductDeleteAlertDialog } from "./_components/product-delete-alert-dialog"

export default function ProductsPage() {
  return (
    <RowActionsProvider>
      <AppHeader>
        <AppHeaderNav page="Products" />
        <AppHeaderActions>
          <CreateProductDialog />
        </AppHeaderActions>
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <ProductsTable />
        <ProductEditDrawer />
        <ProductDeleteAlertDialog />
      </main>
    </RowActionsProvider>
  )
}

function CreateProductDialog() {
  const [open, setOpen] = useState(false)

  const form = useProductCreateForm({ onSuccess: () => setOpen(false) })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PackagePlus />
        Quick Create
      </DialogTrigger>
      <DialogContent
        onAnimationEnd={(e) => {
          if (!open && e.animationName === "exit") form.reset()
        }}
      >
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription className="sr-only">
            Fill in the basic details to quickly add a new product to your
            catalog.
          </DialogDescription>
        </DialogHeader>
        <ProductCreateForm form={form} />
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Close
          </DialogClose>
          <form.AppForm>
            <form.SubmitButton>Create</form.SubmitButton>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
