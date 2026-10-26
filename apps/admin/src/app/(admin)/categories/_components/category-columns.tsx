import { EmptyCell } from "@/components/empty-cell"
import { DataTableColumnDef } from "@workspace/data-table/types/data-table"
import { Button } from "@workspace/ui/components/button"
import { Category } from "@workspace/api-client"
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

export const categoryColumns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <TableCellViewer category={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="min-w-sm text-pretty text-muted-foreground">
        {row.original.description || <EmptyCell label="No description" />}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <TableCellActions item={row.original} />,
    enableHiding: false,
    meta: { align: "right" },
  },
] satisfies DataTableColumnDef<Category>[]

function TableCellViewer({ category }: { category: Category }) {
  const { openAction } = useRowActions<Category>()

  return (
    <Button
      size="sm"
      variant="link"
      className="px-0"
      onClick={() => openAction("edit", category)}
    >
      {category.name}
    </Button>
  )
}

function TableCellActions({ item }: { item: Category }) {
  const { openAction } = useRowActions<Category>()

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
