import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { format } from "date-fns"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Product } from "@workspace/api-client"
import {
  EditIcon,
  EllipsisVerticalIcon,
  PanelRightIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { EmptyCell } from "@/components/empty-cell"
import { useRowActions } from "@/context/row-actions-provider"
import { ProductStatusBadge } from "./product-status-badge"

export const featuredIcons = {
  true: (
    <StarIcon className="fill-yellow-500 stroke-yellow-500 dark:fill-yellow-400 dark:stroke-yellow-400" />
  ),
  false: <StarIcon className="stroke-muted-foreground" />,
} as const

/** The product table columns. The filters are in `_lib/product-filters`. */
export const productColumns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <TableCellViewer product={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => row.original.sku || <EmptyCell label="No SKU" />,
    meta: { className: "text-muted-foreground font-medium" },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.status && (
        <ProductStatusBadge status={row.original.status} />
      ),
  },
  {
    accessorKey: "featured",
    header: "Featured",
    // The empty star would read as a toggle, so non-featured rows get a dash.
    cell: ({ row }) =>
      row.original.featured ? (
        <>
          {featuredIcons.true}
          <span className="sr-only">Featured</span>
        </>
      ) : (
        <EmptyCell label="Not featured" />
      ),
    meta: {
      align: "center",
      className: "[&>svg]:size-4 [&>svg]:mx-auto",
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) =>
      row.original.category?.name ?? <EmptyCell label="No category" />,
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) =>
      row.original.brand?.name ?? <EmptyCell label="No brand" />,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) =>
      formatPrice(row.original.price) ?? <EmptyCell label="No price" />,
    meta: {
      align: "right",
      className: "tabular-nums",
    },
  },
  {
    accessorKey: "discount_percent",
    header: "Discount",
    cell: ({ row }) =>
      row.original.discount_percent != null ? (
        `${row.original.discount_percent}%`
      ) : (
        <EmptyCell label="No discount" />
      ),
    meta: {
      align: "right",
      className: "tabular-nums",
    },
  },
  {
    // A model property in the API, not a column: it can't be sorted or filtered.
    accessorKey: "active_price",
    header: "Final price",
    cell: ({ row }) =>
      formatPrice(row.original.active_price) ?? <EmptyCell label="No price" />,
    enableSorting: false,
    meta: {
      align: "right",
      className: "tabular-nums",
    },
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
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => format(row.original.created_at, "LLL dd, y"),
    meta: { className: "text-muted-foreground" },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <TableCellActions item={row.original} />,
    enableHiding: false,
    meta: { align: "right" },
  },
] satisfies ColumnDef<Product>[]

function TableCellViewer({ product }: { product: Product }) {
  const { openAction } = useRowActions<Product>()

  return (
    <div className="flex items-center gap-2">
      <Avatar shape="square" size="sm">
        {product.image && <AvatarImage src={product.image} />}
        <AvatarFallback />
      </Avatar>
      <Button
        size="sm"
        variant="link"
        className="px-0"
        onClick={() => openAction("view", product)}
      >
        {product.name}
      </Button>
    </div>
  )
}

function TableCellActions({ item }: { item: Product }) {
  const { openAction } = useRowActions<Product>()

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
