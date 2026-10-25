import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import {
  useRowActionDialog,
  useRowActions,
} from "@/context/row-actions-provider"
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
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Maximize2Icon, MailIcon } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import * as React from "react"
import { CustomerDetails } from "./customer-details"
import { CustomerEditButton } from "./customer-buttons"
import { CustomerEditDrawerContent } from "./customer-edit-drawer"
import Link from "next/link"

export function CustomerViewDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps } = useRowActionDialog<Customer>("view")

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"} {...rootProps}>
      <DrawerContent size="md">
        {row && <CustomerViewDrawerContent customer={row} />}
      </DrawerContent>
    </Drawer>
  )
}

function CustomerViewDrawerContent({ customer }: { customer: Customer }) {
  const isMobile = useIsMobile()
  const { openAction } = useRowActions<Customer>()

  // Edit opens on top of this drawer instead of replacing it, so it's local
  // state: a row action would close the view.
  const [editOpen, setEditOpen] = React.useState(false)

  return (
    <>
      <DrawerHeader className="group-data-[swipe-axis=y]/drawer-popup:text-start">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-12">
              {customer.image && <AvatarImage src={customer.image} />}
              <AvatarFallback />
            </Avatar>
            <div className="flex flex-col gap-1">
              <DrawerTitle className="text-base">{customer.name}</DrawerTitle>
              {customer.email && (
                <DrawerDescription className="flex items-center gap-2">
                  <MailIcon className="size-4" />
                  {customer.email}
                </DrawerDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CustomerEditButton
              customer={customer}
              size="sm"
              onClick={() => setEditOpen(true)}
            />
            <Link
              href={`/customers/${customer.id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Maximize2Icon />
              Open page
            </Link>
          </div>
        </div>
      </DrawerHeader>
      {/* flex-1 keeps the footer at the bottom of the drawer. */}
      <div className="flex-1 scroll-fade overflow-y-auto p-4 pt-8">
        <div className="flex flex-col gap-2">
          <div className="typeset">
            <h3>Customer details</h3>
          </div>
          <CustomerDetails customer={customer} />
        </div>
      </div>
      <DrawerFooter>
        <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
      </DrawerFooter>
      {/* Rendered inside the view's content, so Base UI stacks it as nested. */}
      <Drawer
        swipeDirection={isMobile ? "down" : "right"}
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <DrawerContent size="md">
          <CustomerEditDrawerContent
            customer={customer}
            onSuccess={(updated) => {
              setEditOpen(false)
              // The view shows the table row; swap in the saved customer.
              openAction("view", updated)
            }}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}
