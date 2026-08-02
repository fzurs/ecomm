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
import { IconTagPlus } from "@tabler/icons-react"

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
      {children}
    </>
  )
}

function QuickCreateCategoryDialog() {
  const [open, setOpen] = useState(false)

  const form = useCategoryForm({ setOpen })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconTagPlus />
          Quick Create
        </Button>
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
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
          <form.AppForm>
            <form.Submit>Create</form.Submit>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
