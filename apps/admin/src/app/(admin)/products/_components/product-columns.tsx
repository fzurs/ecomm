import { ColumnDef } from "@tanstack/react-table"
import { Option } from "@workspace/data-table/types/data-table"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
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
  StarIcon,
  Trash2Icon,
} from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useRowActions } from "@/context/row-actions-provider"
import {
  productStatusIcons,
  productStatusOptions,
} from "../_lib/product-status"

const featuredIcons = {
  true: <StarIcon className="fill-yellow-500 text-yellow-500" />,
  false: <StarIcon className="text-muted-foreground" />,
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
      meta: { className: "text-muted-foreground font-medium" },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="min-w-sm text-pretty text-muted-foreground">
          {row.original.description}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) =>
        row.original.category && (
          <Badge variant="secondary">{row.original.category.name}</Badge>
        ),
      meta: {
        thClassName: "pl-4",
        variant: "multi-select",
        options: categoryOptions,
      },
    },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => row.original.brand?.name,
      meta: {
        variant: "multi-select",
        options: brandOptions,
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.status && (
          <Badge variant="outline" className="capitalize">
            {productStatusIcons[row.original.status]}{" "}
            {row.original.status.replaceAll("_", " ")}
          </Badge>
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
      cell: ({ row }) =>
        featuredIcons[row.original.featured ? "true" : "false"],
      meta: {
        thClassName: "text-center",
        className: "[&>svg]:size-4 [&>svg]:mx-auto",
        variant: "boolean",
        options: [
          { label: "Featured", value: "true", icon: featuredIcons.true },
          { label: "Not Featured", value: "false", icon: featuredIcons.false },
        ],
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => formatPrice(row.original.price),
      meta: {
        thClassName: "text-right",
        className: "text-right text-green-500",
        variant: "range",
      },
    },
    {
      accessorKey: "discount_price",
      header: "Discount",
      cell: ({ row }) => formatPrice(row.original.discount_price),
      meta: {
        className: "text-amber-500",
        variant: "range",
      },
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
        onClick={() => openAction("edit", product)}
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
