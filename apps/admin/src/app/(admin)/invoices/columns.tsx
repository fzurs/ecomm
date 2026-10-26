import { ColumnDef } from "@tanstack/react-table"
import { Invoice } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { cn } from "cn"
import { FileTextIcon } from "lucide-react"
import { useState } from "react"
import { invoiceStatuses } from "./_lib/invoice-status"

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "document_name",
    header: "Document",
    cell: ({ row }) => <TableCellViewer invoice={row.original} />,
    enableSorting: false,
  },
  {
    accessorKey: "total_amount",
    header: "Amount",
    cell: ({ row }) => {
      const value = Number(row.original.total_amount).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      return `$ ${value}`
    },
    meta: { align: "right" },
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { label, badge } = invoiceStatuses[row.original.status || "pending"]
      return <Badge className={cn("h-6 rounded-md", badge)}>{label}</Badge>
    },
    enableSorting: false,
  },
]

function TableCellViewer({ invoice }: { invoice: Invoice }) {
  const [now] = useState(Date.now)
  const createdAt = new Date(invoice.created_at)
  const isRecent = createdAt > new Date(now - 5 * 60 * 1000)

  return (
    <Drawer swipeDirection="right">
      <div className="flex items-center gap-2">
        <DrawerTrigger render={<Button variant="link" className="px-0" />}>
          {invoice.document_name}
        </DrawerTrigger>
        {isRecent && (
          <Badge className="bg-blue-500/15 text-blue-900 dark:text-blue-400">
            New
          </Badge>
        )}
      </div>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{invoice.document_name}</DrawerTitle>
          <DrawerDescription className="sr-only">
            Invoice details.
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 px-4">
          <div className="flex aspect-video w-full items-center justify-center rounded-md bg-secondary/30">
            <FileTextIcon className="size-8 text-muted-foreground" />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
