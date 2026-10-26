import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { Brand } from "@workspace/api-client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { EditIcon, EllipsisVerticalIcon, Trash2Icon } from "lucide-react"
import { useRowActions } from "@/context/row-actions-provider"

export const brandColumns: ColumnDef<Brand>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <TableCellViewer brand={row.original} />,
    enableHiding: false,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <TableCellActions item={row.original} />,
    enableHiding: false,
    meta: { align: "right" },
  },
]

function TableCellViewer({ brand }: { brand: Brand }) {
  const { openAction } = useRowActions<Brand>()

  return (
    <Button
      size="sm"
      variant="link"
      className="px-0"
      onClick={() => openAction("edit", brand)}
    >
      {brand.name}
    </Button>
  )
}

function TableCellActions({ item }: { item: Brand }) {
  const { openAction } = useRowActions<Brand>()

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
