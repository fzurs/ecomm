import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { useRowActions } from "../_context/row-actions-provider"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { Customer } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
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

  const { open, setOpen, currentRow, setCurrentRow } = useRowActions<Customer>()

  const handleOpenChange = (open: boolean) => setOpen(open ? "view" : null)

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open === "view"}
      onOpenChange={handleOpenChange}
    >
      <DrawerContent
        className="data-[vaul-drawer-direction=right]:sm:max-w-lg"
        onAnimationEnd={() => open === null && setCurrentRow(null)}
      >
        {currentRow && <CustomerViewDrawerContent item={currentRow} />}
      </DrawerContent>
    </Drawer>
  )
}

function CustomerViewDrawerContent({ item }: { item: Customer }) {
  return (
    <>
      <div
        className="flex items-center justify-between gap-4 border-b px-4"
        style={{ height: "calc(var(--spacing) * 12)" }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Customers</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{item.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex h-4 items-center gap-2 text-muted-foreground">
          <Button size="icon-sm" variant="ghost" asChild>
            <Link href={`/customers/${item.id}`}>
              <FullscreenIcon />
              <span className="sr-only">Go to customer details page</span>
            </Link>
          </Button>
          <Separator orientation="vertical" />
          <DialogClose asChild>
            <Button size="icon-sm" variant="ghost">
              <XIcon />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </div>
      </div>
      <DrawerHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-12">
              {item.image && <AvatarImage src={item.image} />}
              <AvatarFallback />
            </Avatar>
            <div className="flex flex-col gap-2">
              <DrawerTitle>{item.name}</DrawerTitle>
              <DrawerDescription className="flex items-center gap-1.5">
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
      <div className="overflow-auto px-4 pt-2 pb-4">
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
