"use client"
import { EmptyCell } from "@/components/empty-cell"
import { documentTypes, vatConditions } from "@/lib/fiscal"
import { DataTableColumnDef } from "@workspace/data-table/types/data-table"
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

export const customerColumns: DataTableColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <TableCellViewer customer={row.original} />,
    enableHiding: false,
  },
  // Who the customer is, then how they're invoiced, then contact. The ones
  // hidden by default (`customers-table`) are next to what they complement.
  // The API orders by name and email only.
  {
    accessorKey: "legal_name",
    header: "Legal name",
    cell: ({ row }) =>
      row.original.legal_name || <EmptyCell label="Same as the name" />,
    enableSorting: false,
  },
  {
    accessorKey: "document_number",
    header: "Document",
    cell: ({ row }) => {
      const { document_type, document_number } = row.original
      if (!document_number) return <EmptyCell label="No document" />
      return (
        <span className="tabular-nums">
          <span className="text-muted-foreground">
            {documentTypes[document_type ?? 80]}
          </span>{" "}
          {document_number}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "vat_condition",
    header: "IVA condition",
    cell: ({ row }) => {
      const label = vatConditions[row.original.vat_condition ?? 5]
      // Some of ARCA's names are long: truncated, whole on hover.
      return (
        <span className="block max-w-48 truncate" title={label}>
          {label}
        </span>
      )
    },
    enableSorting: false,
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
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => row.original.address || <EmptyCell label="No address" />,
    meta: { className: "text-muted-foreground" },
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
