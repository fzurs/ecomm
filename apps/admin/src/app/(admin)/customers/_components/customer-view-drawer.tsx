import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { useRowActionDialog } from "@/context/row-actions-provider"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { Customer } from "@workspace/api-client"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { FullscreenIcon, MailIcon, XIcon } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import * as React from "react"
import { CustomerDetails } from "./customer-details"
import { CustomerEditButton } from "./customer-buttons"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { DialogClose } from "@workspace/ui/components/dialog"
import { Separator } from "@workspace/ui/components/separator"
import Link from "next/link"

export function CustomerViewDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps } = useRowActionDialog<Customer>("view")

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"} {...rootProps}>
      <DrawerContent size="md">
        {row && <CustomerViewDrawerContent item={row} />}
      </DrawerContent>
    </Drawer>
  )
}

function CustomerViewDrawerContent({ item }: { item: Customer }) {
  return (
    <>
      <div className="flex h-(--header-height) items-center justify-between gap-4 border-b px-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Customers</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{item.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex h-4 items-center gap-2 text-muted-foreground">
          <Link
            href={`/customers/${item.id}`}
            className={buttonVariants({ size: "icon-sm", variant: "ghost" })}
          >
            <FullscreenIcon />
            <span className="sr-only">Go to customer details page</span>
          </Link>
          <Separator orientation="vertical" />
          <DialogClose render={<Button size="icon-sm" variant="ghost" />}>
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
      </div>
      <DrawerHeader className="group-data-[swipe-axis=y]/drawer-popup:text-start">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-12">
              {item.image && <AvatarImage src={item.image} />}
              <AvatarFallback />
            </Avatar>
            <div className="flex flex-col gap-1">
              <DrawerTitle className="text-base">{item.name}</DrawerTitle>
              <DrawerDescription className="flex items-center gap-2">
                <MailIcon className="size-4" />
                {item.email}
              </DrawerDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CustomerEditButton customer={item} size="sm" />
          </div>
        </div>
      </DrawerHeader>
      <div className="overflow-auto p-4 pt-8">
        <div className="flex flex-col gap-2">
          <div className="typeset">
            <h3>Customer details</h3>
          </div>
          <CustomerDetails customer={item} />
        </div>
      </div>
    </>
  )
}
