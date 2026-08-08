import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { useRowActions } from "./customer-provider"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
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

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open === "edit"}
      onOpenChange={(open) => setOpen(open ? "edit" : null)}
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
            setOpen={(open) => setOpen(open ? "edit" : null)}
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
        <DrawerTitle>{item.name}</DrawerTitle>
      </DrawerHeader>
      <div className="overflow-auto px-4 pb-4">
        <CustomerForm form={form} />
      </div>
      <DrawerFooter>
        <DrawerClose asChild>
          <Button variant="outline">Close</Button>
        </DrawerClose>
        <form.AppForm>
          <form.Submit>Save</form.Submit>
        </form.AppForm>
      </DrawerFooter>
    </>
  )
}
