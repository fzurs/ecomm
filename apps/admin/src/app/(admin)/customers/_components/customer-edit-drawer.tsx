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
import { Customer } from "@workspace/api-client"
import { CustomerEditForm, useCustomerEditForm } from "./customer-edit-form"
import { Button } from "@workspace/ui/components/button"

export function CustomerEditDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps, closeAction } = useRowActionDialog<Customer>("edit")

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"} {...rootProps}>
      <DrawerContent>
        {row && (
          <CustomerEditDrawerContent customer={row} onSuccess={closeAction} />
        )}
      </DrawerContent>
    </Drawer>
  )
}

function CustomerEditDrawerContent({
  customer,
  onSuccess,
}: {
  customer: Customer
  onSuccess: () => void
}) {
  const form = useCustomerEditForm({ customer, onSuccess })

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Edit customer</DrawerTitle>
        <DrawerDescription>
          Changes are saved to the customer&apos;s profile.
        </DrawerDescription>
      </DrawerHeader>
      <div className="overflow-auto px-4 pt-2">
        <CustomerEditForm form={form} />
      </div>
      <DrawerFooter>
        <form.AppForm>
          <form.SubmitButton>Save</form.SubmitButton>
        </form.AppForm>
        <DrawerClose render={<Button variant="secondary" />}>Close</DrawerClose>
      </DrawerFooter>
    </>
  )
}
