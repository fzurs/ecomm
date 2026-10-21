import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { useRowActions } from "@/context/row-actions-provider"
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
import { CustomerForm, useCustomerForm } from "./customer-form"
import { Button } from "@workspace/ui/components/button"

export function CustomerEditDrawer() {
  const isMobile = useIsMobile()

  const { open, setOpen, currentRow, setCurrentRow } = useRowActions<Customer>()

  const handleOpenChange = (open: boolean) => setOpen(open ? "edit" : null)

  return (
    <Drawer
      swipeDirection={isMobile ? "down" : "right"}
      open={open === "edit"}
      onOpenChange={handleOpenChange}
    >
      <DrawerContent
        onAnimationEnd={() => {
          if (open === null) {
            setCurrentRow(null)
          }
        }}
      >
        {currentRow && (
          <CustomerEditDrawerContent
            item={currentRow}
            setOpen={handleOpenChange}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

function CustomerEditDrawerContent({
  item,
  setOpen,
}: {
  item: Customer
  setOpen: (open: boolean) => void
}) {
  const form = useCustomerForm({ customer: item, setOpen })

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Edit customer</DrawerTitle>
        <DrawerDescription>
          Changes are saved to the customer&apos;s profile.
        </DrawerDescription>
      </DrawerHeader>
      <div className="overflow-auto px-4 pt-2">
        <CustomerForm form={form} />
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
