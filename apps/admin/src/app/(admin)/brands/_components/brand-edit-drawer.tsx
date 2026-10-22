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
import { BrandForm, useBrandForm } from "./brand-form"
import { Button } from "@workspace/ui/components/button"

export function BrandEditDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps } = useRowActionDialog<Brand>("edit")

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"} {...rootProps}>
      <DrawerContent>
        {row && (
          <BrandEditDrawerContent
            brand={row}
            setOpen={rootProps.onOpenChange}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

function BrandEditDrawerContent({
  brand,
  setOpen,
}: {
  brand: Brand
  setOpen: (open: boolean) => void
}) {
  const form = useBrandForm({ brand, setOpen })

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>{brand.name}</DrawerTitle>
        <DrawerDescription className="sr-only">
          Edit the brand details.
        </DrawerDescription>
      </DrawerHeader>
      <div className="overflow-auto px-4">
        <BrandForm form={form} />
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
