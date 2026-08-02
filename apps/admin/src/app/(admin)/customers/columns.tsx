"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Customer } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { CustomerForm, useCustomerForm } from "./form"
import { useState } from "react"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    cell: ({ row }) => <TableCellViewer item={row.original} />,
    meta: { thClassName: "pl-5" },
  },
  { accessorKey: "email", meta: { className: "text-muted-foreground" } },
  { accessorKey: "phone" },
]

function TableCellViewer({ item }: { item: Customer }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const form = useCustomerForm({ customer: item, setOpen })

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        <Button size="sm" variant="link">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
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
      </DrawerContent>
    </Drawer>
  )
}
