"use client"
import {
  AppHeader,
  AppHeaderNav,
  AppHeaderActions,
} from "@/components/app-header"
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
import { useState } from "react"
import { CategoryForm, useCategoryForm } from "./form"
import { Button } from "@workspace/ui/components/button"
import { PlusIcon } from "lucide-react"

export default function CategoriesLayout({
  children,
}: LayoutProps<"/categories">) {
  return (
    <>
      <AppHeader>
        <AppHeaderNav items={[{ type: "page", label: "Categories" }]} />
        <AppHeaderActions>
          <QuickCreateCategoryDialog />
        </AppHeaderActions>
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        {children}
      </main>
    </>
  )
}

function QuickCreateCategoryDialog() {
  const [open, setOpen] = useState(false)

  const form = useCategoryForm({ setOpen })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon />
        Quick Create
      </DialogTrigger>
      <DialogContent
        onAnimationEnd={(e) => {
          if (!open && e.animationName === "exit") form.reset()
        }}
      >
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription className="sr-only">
            These categories can be assigned to products to be able to filter
            and sort them.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm form={form} variant="required" />
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
