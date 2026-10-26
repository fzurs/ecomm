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
import { CategoryEditForm, useCategoryEditForm } from "./category-edit-form"
import { Button } from "@workspace/ui/components/button"

export function CategoryEditDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps, closeAction } = useRowActionDialog<Category>("edit")

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"} {...rootProps}>
      <DrawerContent>
        {row && (
          // The key remounts the form when another category is opened.
          <CategoryEditDrawerContent
            key={row.id}
            category={row}
            onSuccess={closeAction}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

function CategoryEditDrawerContent({
  category,
  onSuccess,
}: {
  category: Category
  onSuccess: () => void
}) {
  const form = useCategoryEditForm({ category, onSuccess })

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Edit category</DrawerTitle>
        <DrawerDescription>
          Changes apply to every product in this category.
        </DrawerDescription>
      </DrawerHeader>
      <div className="flex-1 scroll-fade overflow-auto p-4">
        <CategoryEditForm form={form} />
      </div>
      <DrawerFooter>
        <form.AppForm>
          <form.SubmitButton>Save changes</form.SubmitButton>
        </form.AppForm>
        <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
      </DrawerFooter>
    </>
  )
}
