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
import { EditIcon, EllipsisVertical, Trash2Icon, ViewIcon } from "lucide-react"
import { useRowActions } from "@/context/row-actions-provider"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

export const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "image",
    cell: ({ row }) => {
      const customer = row.original
      return (
        <Avatar>
          {customer.image && <AvatarImage src={customer.image} />}
          <AvatarFallback />
        </Avatar>
      )
    },
    enableSorting: false,
    meta: {
      thClassName: "text-center",
      className: "flex justify-center",
    },
  },
  {
    accessorKey: "name",
    cell: ({ row }) => <TableCellViewer customer={row.original} />,
    meta: { thClassName: "pl-5" },
    enableHiding: false,
  },
  { accessorKey: "email", meta: { className: "text-muted-foreground" } },
  {
    accessorKey: "phone",
    meta: { className: "text-muted-foreground font-medium" },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <TableCellActions item={row.original} />,
    enableHiding: false,
  },
]

function TableCellViewer({ customer }: { customer: Customer }) {
  const { setOpen, setCurrentRow } = useRowActions()

  return (
    <Button
      size="sm"
      variant="link"
      onClick={() => {
        setOpen("view")
        setCurrentRow(customer)
      }}
    >
      {customer.name}
    </Button>
  )
}

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
              setOpen("view")
              setCurrentRow(item)
            }}
          >
            <ViewIcon />
            Customer details
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setOpen("edit")
              setCurrentRow(item)
            }}
          >
            <EditIcon />
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
