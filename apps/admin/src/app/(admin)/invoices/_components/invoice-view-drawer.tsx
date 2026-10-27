import { useQuery } from "@tanstack/react-query"
import { Invoice } from "@workspace/api-client"
import { invoicesRetrieveOptions } from "@workspace/api-client/query"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { CalendarIcon, Maximize2Icon } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useRowActionDialog } from "@/context/row-actions-provider"
import { voucherName } from "../_lib/voucher-type"
import { ArcaMessages } from "./arca-messages"
import { InvoiceActions } from "./invoice-actions"
import { InvoiceDetails } from "./invoice-details"
import { InvoiceLinesTable } from "./invoice-lines-table"
import { InvoiceStatusBadge } from "./invoice-status-badge"

export function InvoiceViewDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps } = useRowActionDialog<Invoice>("view")

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"} {...rootProps}>
      <DrawerContent size="lg">
        {row && <InvoiceViewDrawerContent row={row} />}
      </DrawerContent>
    </Drawer>
  )
}

function InvoiceViewDrawerContent({ row }: { row: Invoice }) {
  // The detail query: an emission from the actions shows up here right away.
  const { data: invoice } = useQuery(
    invoicesRetrieveOptions({ path: { id: row.id } })
  )
  const current = invoice ?? row

  return (
    <>
      <DrawerHeader className="group-data-[swipe-axis=y]/drawer-popup:text-start">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-col gap-1">
              <DrawerTitle className="text-base">
                {voucherName(current)}
              </DrawerTitle>
              <DrawerDescription className="flex items-center gap-2">
                <CalendarIcon className="size-4" />
                Created {format(current.created_at, "MMMM dd, yyyy - p")}
              </DrawerDescription>
            </div>
            <InvoiceStatusBadge status={current.status} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <InvoiceActions invoice={current} size="sm" />
            <Link
              href={`/invoices/${current.id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Maximize2Icon />
              Open page
            </Link>
          </div>
        </div>
      </DrawerHeader>
      <div className="flex flex-1 scroll-fade flex-col gap-8 overflow-y-auto p-4 pt-8">
        {invoice ? (
          <>
            <ArcaMessages invoice={invoice} />
            <div className="flex flex-col gap-2">
              <div className="typeset">
                <h3>Lines</h3>
              </div>
              <InvoiceLinesTable lines={invoice.lines} amounts={invoice} />
            </div>
          </>
        ) : (
          <Skeleton className="h-40 w-full" />
        )}
        <div className="flex flex-col gap-2">
          <div className="typeset">
            <h3>Details</h3>
          </div>
          <InvoiceDetails invoice={current} />
        </div>
      </div>
      <DrawerFooter>
        <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
      </DrawerFooter>
    </>
  )
}
