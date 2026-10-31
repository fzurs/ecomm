import { ShippingZone } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { useRowActionDialog } from "@/context/row-actions-provider"
import { ShippingZoneFields } from "./shipping-zone-fields"
import { useShippingZoneEditForm } from "./shipping-zone-edit-form"

export function ShippingZoneEditDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps, closeAction } =
    useRowActionDialog<ShippingZone>("edit")

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"} {...rootProps}>
      <DrawerContent>
        {row && (
          <ShippingZoneEditDrawerContent zone={row} onSuccess={closeAction} />
        )}
      </DrawerContent>
    </Drawer>
  )
}

function ShippingZoneEditDrawerContent({
  zone,
  onSuccess,
}: {
  zone: ShippingZone
  onSuccess: () => void
}) {
  const form = useShippingZoneEditForm({ zone, onSuccess })

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Edit shipping zone</DrawerTitle>
        <DrawerDescription>
          New orders pay the new cost; placed ones keep theirs.
        </DrawerDescription>
      </DrawerHeader>
      <div className="flex-1 scroll-fade overflow-auto p-4">
        <ShippingZoneFields form={form} />
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
