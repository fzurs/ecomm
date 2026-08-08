"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Customer } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Edit2, EllipsisVertical, Trash2Icon } from "lucide-react"
import { useRowActions } from "./customer-provider"

export const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    cell: function RenderCell({ row }) {
      const { setOpen, setCurrentRow } = useRowActions()

      return (
        <Button
          size="sm"
          variant="link"
          onClick={() => {
            setOpen("edit")
            setCurrentRow(row.original)
          }}
        >
          {row.original.name}
        </Button>
      )
    },
    meta: { thClassName: "pl-5" },
    enableHiding: false,
  },
  { accessorKey: "email", meta: { className: "text-muted-foreground" } },
  { accessorKey: "phone", enableSorting: false },
  {
    id: "actions",
    cell: ({ row }) => <TableCellActions item={row.original} />,
    enableHiding: false,
  },
]

function TableCellActions({ item }: { item: Customer }) {
  const { setOpen, setCurrentRow } = useRowActions()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`${item.name} actions`}
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              setOpen("edit")
              setCurrentRow(item)
            }}
          >
            <Edit2 />
            Edit customer
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              setOpen("delete")
              setCurrentRow(item)
            }}
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
