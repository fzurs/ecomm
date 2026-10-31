import { ShippingZone } from "@workspace/api-client"
import { DataTableColumnDef } from "@workspace/data-table/types/data-table"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { EditIcon, EllipsisVerticalIcon, Trash2Icon } from "lucide-react"
import { EmptyCell } from "@/components/empty-cell"
import { useRowActions } from "@/context/row-actions-provider"
import { provinces } from "@/lib/provinces"
import { formatPrice } from "@/lib/utils"

export const shippingZoneColumns: DataTableColumnDef<ShippingZone>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <TableCellViewer zone={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: "provinces",
    header: "Provinces",
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-md whitespace-normal text-muted-foreground">
        {row.original.provinces.map((code) => provinces[code]).join(", ")}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => formatPrice(row.original.cost),
    meta: { align: "right", className: "tabular-nums" },
  },
  {
    accessorKey: "free_from",
    header: "Free from",
    cell: ({ row }) =>
      row.original.free_from != null ? (
        formatPrice(row.original.free_from)
      ) : (
        <EmptyCell label="Never free" />
      ),
    meta: { align: "right", className: "tabular-nums" },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <TableCellActions item={row.original} />,
    enableHiding: false,
    meta: { align: "right" },
  },
]

function TableCellViewer({ zone }: { zone: ShippingZone }) {
  const { openAction } = useRowActions<ShippingZone>()

  return (
    <Button
      size="sm"
      variant="link"
      className="px-0"
      onClick={() => openAction("edit", zone)}
    >
      {zone.name}
    </Button>
  )
}

function TableCellActions({ item }: { item: ShippingZone }) {
  const { openAction } = useRowActions<ShippingZone>()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`${item.name} actions`}
          />
        }
      >
        <EllipsisVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openAction("edit", item)}>
            <EditIcon />
            Edit
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => openAction("delete", item)}
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
