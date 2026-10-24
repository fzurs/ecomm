"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

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
  CategoryCreateForm,
  useCategoryCreateForm,
} from "./_components/category-create-form"
import { CategoriesTable } from "./_components/categories-table"
import { CategoryEditDrawer } from "./_components/category-edit-drawer"
import { CategoryDeleteAlertDialog } from "./_components/category-delete-alert-dialog"

export default function CategoriesPage() {
  return (
    <RowActionsProvider>
      <AppHeader>
        <AppHeaderNav page="Categories" />
        <AppHeaderActions>
          <CreateCategoryDialog />
        </AppHeaderActions>
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <CategoriesTable />
        <CategoryEditDrawer />
        <CategoryDeleteAlertDialog />
      </main>
    </RowActionsProvider>
  )
}

function CreateCategoryDialog() {
  const [open, setOpen] = useState(false)

  const form = useCategoryCreateForm({ onSuccess: () => setOpen(false) })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon />
        Create
      </DialogTrigger>
      <DialogContent
        onAnimationEnd={(e) => {
          if (!open && e.animationName === "exit") form.reset()
        }}
      >
        <DialogHeader>
          <DialogTitle>Create category</DialogTitle>
          <DialogDescription className="sr-only">
            These categories can be assigned to products to be able to filter
            and sort them.
          </DialogDescription>
        </DialogHeader>
        <CategoryCreateForm form={form} />
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
