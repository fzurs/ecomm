import { ColumnDef } from "@tanstack/react-table"
import { Invoice, InvoiceStatus } from "@workspace/api-client"
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
import { cn } from "@workspace/ui/lib/utils"
import { FileTextIcon } from "lucide-react"
import { useState } from "react"

const statusClasses: Record<InvoiceStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-900 dark:text-yellow-400",
  success: "bg-green-500/15 text-green-900 dark:text-green-400",
  error: "bg-red-500/15 text-red-900 dark:text-red-400",
}

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "document_name",
    header: "Document",
    cell: ({ row }) => <TableCellViewer invoice={row.original} />,
    enableSorting: false,
    meta: {
      thClassName: "pl-5"
    }
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
    meta: { className: "text-right", thClassName: "text-right" },
    enableSorting: false,
  },
  {
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status || "pending"
      return (
        <Badge
          className={cn("h-6 rounded-md capitalize", statusClasses[status])}
        >
          {status}
        </Badge>
      )
    },
    enableSorting: false,
  },
]

function TableCellViewer({ invoice }: { invoice: Invoice }) {
  const [now] = useState(Date.now)
  const createdAt = new Date(invoice.created_at)
  const isRecent = createdAt > new Date(now - 5 * 60 * 1000)

  return (
    <Drawer direction="right">
      <div className="flex items-center">
        <DrawerTrigger asChild>
          <Button variant="link">{invoice.document_name}</Button>
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
