import { RevocationRequest } from "@workspace/api-client"
import { DataTableColumnDef } from "@workspace/data-table/types/data-table"
import { Button } from "@workspace/ui/components/button"
import { format } from "date-fns"
import Link from "next/link"
import { StatusBadge } from "@/components/status"
import { useRowActions } from "@/context/row-actions-provider"
import { revocationStatuses } from "../_lib/revocation-status"

export const revocationColumns: DataTableColumnDef<RevocationRequest>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => <TableCellViewer revocation={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "order",
    header: "Order",
    cell: ({ row }) => (
      <Link
        href={`/orders/${row.original.order.number}`}
        className="underline-offset-4 hover:underline"
      >
        {row.original.order.number}
      </Link>
    ),
    enableSorting: false,
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.order.customer_name}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.email}
        </span>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge {...revocationStatuses[row.original.status]} />
    ),
  },
  {
    accessorKey: "created_at",
    header: "Requested",
    cell: ({ row }) => format(row.original.created_at, "MMM dd, yyyy - p"),
  },
]

function TableCellViewer({ revocation }: { revocation: RevocationRequest }) {
  const { openAction } = useRowActions<RevocationRequest>()

  return (
    <Button
      size="sm"
      variant="link"
      className="px-0"
      onClick={() => openAction("view", revocation)}
    >
      {revocation.code}
    </Button>
  )
}
