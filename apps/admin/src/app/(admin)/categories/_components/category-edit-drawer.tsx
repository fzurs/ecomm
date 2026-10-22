import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { useRowActionDialog } from "@/context/row-actions-provider"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { Category } from "@workspace/api-client"
import { CategoryForm, useCategoryForm } from "./category-form"
import { Button } from "@workspace/ui/components/button"

export function CategoryEditDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps } = useRowActionDialog<Category>("edit")

  return (
    // Not modal and not dismissed by outside clicks: clicking another row swaps
    // the category instead of closing and reopening the drawer.
    <Drawer
      swipeDirection={isMobile ? "down" : "right"}
      modal={false}
      disablePointerDismissal
      {...rootProps}
    >
      <DrawerContent>
        {row && (
          // The key remounts the form when another category is opened.
          <CategoryEditDrawerContent
            key={row.id}
            category={row}
            setOpen={rootProps.onOpenChange}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

function CategoryEditDrawerContent({
  category,
  setOpen,
}: {
  category: Category
  setOpen: (open: boolean) => void
}) {
  const form = useCategoryForm({ category, setOpen })

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>{category.name}</DrawerTitle>
        <DrawerDescription className="sr-only">
          Edit the category details.
        </DrawerDescription>
      </DrawerHeader>
      <div className="overflow-auto px-4">
        <CategoryForm form={form} />
      </div>
      <DrawerFooter>
        <form.AppForm>
          <form.SubmitButton>Save changes</form.SubmitButton>
        </form.AppForm>
        <DrawerClose render={<Button variant="secondary" />}>Close</DrawerClose>
      </DrawerFooter>
    </>
  )
}
