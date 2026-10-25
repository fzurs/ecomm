import { ColumnDef } from "@tanstack/react-table"
import { Option } from "@workspace/data-table/types/data-table"
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
import {
  ProductStatusBadge,
  productStatusOptions,
} from "../_lib/product-status"

const featuredIcons = {
  true: (
    <StarIcon className="fill-yellow-500 stroke-yellow-500 dark:fill-yellow-400 dark:stroke-yellow-400" />
  ),
  false: <StarIcon className="stroke-muted-foreground" />,
} as const

/**
 * The product table columns. The category and brand filter options come from
 * the API, so they're parameters; `useProductColumns` fetches them.
 */
export function getProductColumns({
  categoryOptions,
  brandOptions,
}: {
  categoryOptions?: Option[]
  brandOptions?: Option[]
}) {
  // `as const` keeps the literal column keys that useFilters types filters by.
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <TableCellViewer product={row.original} />,
      enableHiding: false,
      meta: { variant: "text" },
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
      meta: {
        thClassName: "pl-4",
        variant: "multi-select",
        options: productStatusOptions,
      },
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
        thClassName: "text-center",
        className: "text-center [&>svg]:size-4 [&>svg]:mx-auto",
        variant: "boolean",
        options: [
          { label: "Featured", value: "true", icon: featuredIcons.true },
          { label: "Not Featured", value: "false", icon: featuredIcons.false },
        ],
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) =>
        row.original.category?.name ?? <EmptyCell label="No category" />,
      meta: {
        variant: "multi-select",
        options: categoryOptions,
      },
    },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) =>
        row.original.brand?.name ?? <EmptyCell label="No brand" />,
      meta: {
        variant: "multi-select",
        options: brandOptions,
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) =>
        formatPrice(row.original.price) ?? <EmptyCell label="No price" />,
      meta: {
        thClassName: "text-right",
        className: "text-right tabular-nums",
        variant: "range",
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
        thClassName: "text-right",
        className: "text-right tabular-nums",
        variant: "range",
      },
    },
    {
      // A model property in the API, not a column: it can't be sorted or filtered.
      accessorKey: "active_price",
      header: "Final price",
      cell: ({ row }) =>
        formatPrice(row.original.active_price) ?? (
          <EmptyCell label="No price" />
        ),
      enableSorting: false,
      meta: {
        thClassName: "text-right",
        className: "text-right tabular-nums",
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
      meta: {
        className: "text-muted-foreground",
        variant: "date-range",
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <TableCellActions item={row.original} />,
      enableHiding: false,
      meta: { className: "text-right" },
    },
  ] as const satisfies ColumnDef<Product>[]
}

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
