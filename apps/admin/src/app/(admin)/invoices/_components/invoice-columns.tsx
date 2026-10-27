import { EmptyCell } from "@/components/empty-cell"
import { useRowActions } from "@/context/row-actions-provider"
import { formatPrice } from "@/lib/utils"
import { Invoice } from "@workspace/api-client"
import { DataTableColumnDef } from "@workspace/data-table/types/data-table"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { cn } from "cn"
import { format } from "date-fns"
import Link from "next/link"
import { voucherTypes } from "../_lib/voucher-type"
import { InvoiceRowActions } from "./invoice-row-actions"
import { InvoiceStatusBadge } from "./invoice-status-badge"

export const invoiceColumns = [
  {
    accessorKey: "number",
    header: "Voucher",
    cell: ({ row }) => <TableCellViewer invoice={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: "voucher_type",
    header: "Type",
    cell: ({ row }) => voucherTypes[row.original.voucher_type],
    enableSorting: false,
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => formatPrice(row.original.total_amount),
    meta: {
      align: "right",
      className: "font-semibold",
    },
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer
      return (
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {customer.image && <AvatarImage src={customer.image} />}
            <AvatarFallback />
          </Avatar>
          <Link
            href={`/customers/${customer.id}`}
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "px-0"
            )}
          >
            {customer.name}
          </Link>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "order_number",
    header: "Order",
    cell: ({ row }) => (
      <Link
        href={`/orders/${row.original.order_number}`}
        className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
      >
        {row.original.order_number}
      </Link>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "issue_date",
    header: "Issued",
    cell: ({ row }) =>
      row.original.issue_date ? (
        format(row.original.issue_date, "MMM dd")
      ) : (
        <EmptyCell label="Not issued" />
      ),
    meta: { className: "text-muted-foreground" },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <InvoiceRowActions item={row.original} />,
    enableHiding: false,
  },
] satisfies DataTableColumnDef<Invoice>[]

function TableCellViewer({ invoice }: { invoice: Invoice }) {
  const { openAction } = useRowActions<Invoice>()

  return (
    <Button
      size="sm"
      variant="link"
      className="px-0 font-medium"
      onClick={() => openAction("view", invoice)}
    >
      {invoice.display_number ?? "Not issued"}
    </Button>
  )
}
