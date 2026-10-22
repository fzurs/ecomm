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
import { Brand } from "@workspace/api-client"
import { BrandEditForm, useBrandEditForm } from "./brand-edit-form"
import { Button } from "@workspace/ui/components/button"

export function BrandEditDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps, closeAction } = useRowActionDialog<Brand>("edit")

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"} {...rootProps}>
      <DrawerContent>
        {row && <BrandEditDrawerContent brand={row} onSuccess={closeAction} />}
      </DrawerContent>
    </Drawer>
  )
}

function BrandEditDrawerContent({
  brand,
  onSuccess,
}: {
  brand: Brand
  onSuccess: () => void
}) {
  const form = useBrandEditForm({ brand, onSuccess })

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Edit brand</DrawerTitle>
        <DrawerDescription>
          Changes apply to every product of this brand.
        </DrawerDescription>
      </DrawerHeader>
      <div className="overflow-auto p-4">
        <BrandEditForm form={form} />
      </div>
      <DrawerFooter>
        <form.AppForm>
          <form.SubmitButton>Save Changes</form.SubmitButton>
        </form.AppForm>
        <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
      </DrawerFooter>
    </>
  )
}
