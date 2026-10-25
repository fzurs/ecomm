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
import { Product } from "@workspace/api-client"
import { ProductEditForm, useProductEditForm } from "./product-edit-form"
import { Button } from "@workspace/ui/components/button"

export function ProductEditDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps, closeAction } = useRowActionDialog<Product>("edit")

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"} {...rootProps}>
      <DrawerContent size="md">
        {row && (
          // The key remounts the form when another product is opened.
          <ProductEditDrawerContent
            key={row.id}
            product={row}
            onSuccess={closeAction}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

export function ProductEditDrawerContent({
  product,
  onSuccess,
}: {
  product: Product
  onSuccess: (product: Product) => void
}) {
  const form = useProductEditForm({ product, onSuccess })

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Edit product</DrawerTitle>
        <DrawerDescription>{product.name}</DrawerDescription>
      </DrawerHeader>
      <div className="flex-1 scroll-fade overflow-y-auto p-4">
        <ProductEditForm form={form} product={product} />
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
