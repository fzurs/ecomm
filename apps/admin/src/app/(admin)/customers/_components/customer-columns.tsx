"use client"
import { EmptyCell } from "@/components/empty-cell"
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
import {
  EditIcon,
  EllipsisVerticalIcon,
  PanelRightIcon,
  Trash2Icon,
} from "lucide-react"
import { useRowActions } from "@/context/row-actions-provider"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

export const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <TableCellViewer customer={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email || <EmptyCell label="No email" />,
    meta: { className: "text-muted-foreground" },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone || <EmptyCell label="No phone" />,
    meta: { className: "text-muted-foreground font-medium" },
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <TableCellActions item={row.original} />,
    enableHiding: false,
  },
]

function TableCellViewer({ customer }: { customer: Customer }) {
  const { openAction } = useRowActions<Customer>()

  return (
    <div className="flex items-center gap-2">
      <Avatar size="sm">
        {customer.image && <AvatarImage src={customer.image} />}
        <AvatarFallback />
      </Avatar>
      <Button
        size="sm"
        variant="link"
        className="px-0"
        onClick={() => openAction("view", customer)}
      >
        {customer.name}
      </Button>
    </div>
  )
}

function TableCellActions({ item }: { item: Customer }) {
  const { openAction } = useRowActions<Customer>()

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
          <DropdownMenuItem onClick={() => openAction("view", item)}>
            <PanelRightIcon />
            View details
          </DropdownMenuItem>
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
