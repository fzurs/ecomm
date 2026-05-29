import { queryOptions } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { schemas } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import * as React from "react"
import { z } from "zod"
import { snakeCaseToTitle } from "@/lib/utils"
import { Badge } from "@workspace/ui/components/badge"
import {
  IconCircleDashedCheck,
  IconCircleDashedX,
  IconLoader,
  IconPackageOff,
  IconStar,
  IconTrashX,
} from "@tabler/icons-react"
import { parseAsArrayOf, parseAsString, parseAsStringEnum } from "nuqs"
import {
  getBrandsQueryOptions,
  getCategoriesQueryOptions,
  selectAsOption,
} from "@/lib/query-options"
import { ProductForm, useProductForm } from "./form"

export const getFeaturedIcon = (
  featured: z.infer<typeof schemas.Product>["featured"]
) =>
  featured ? (
    <IconStar className="fill-yellow-500 text-yellow-500" />
  ) : (
    <IconStar className="size-4" />
  )

export const getStatusIcon = (status: z.infer<typeof schemas.StatusEnum>) => {
  const statuses = schemas.StatusEnum.Enum
  switch (status) {
    case statuses.active:
      return <IconCircleDashedCheck className="text-green-500" />
    case statuses.inactive:
      return <IconCircleDashedX className="text-red-500" />
    case statuses.draft:
      return <IconLoader />
    case statuses.out_of_stock:
      return <IconPackageOff className="text-orange-500" />
    case statuses.discontinued:
      return <IconTrashX className="text-red-500" />
    default:
      return null
  }
}

export const statusOptions = schemas.StatusEnum.options.map((status) => ({
  label: snakeCaseToTitle(status),
  value: status,
  icon: getStatusIcon(status),
}))

export const columns = [
  {
    id: "sku",
    header: "SKU",
    accessorKey: "sku",
    enableSorting: false,
  },
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => <TableCellViewer original={row.original} />,
    meta: {
      filter: { variant: "text", parser: parseAsString },
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      if (!row.original.description) return null
      return (
        <div className="min-w-72 text-sm text-pretty text-muted-foreground">
          {row.original.description}
        </div>
      )
    },
  },
  {
    id: "category",
    accessorKey: "Category",
    header: "Category",
    cell: ({ row }) =>
      row.original.category && (
        <Badge variant="secondary">{row.original.category.name}</Badge>
      ),
    meta: {
      filter: {
        variant: "async-multi-select",
        parser: parseAsArrayOf(parseAsString),
        options: queryOptions({
          ...getCategoriesQueryOptions(),
          select: selectAsOption,
        }),
      },
    },
  },
  {
    id: "brand",
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => row.original.brand?.name,
    meta: {
      filter: {
        variant: "async-multi-select",
        parser: parseAsArrayOf(parseAsString),
        options: queryOptions({
          ...getBrandsQueryOptions(),
          select: selectAsOption,
        }),
      },
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const option = statusOptions.find(
        (option) => option.value === row.original.status
      )
      if (!option) return null
      return (
        <div className="flex justify-end">
          <Badge variant={"outline"}>
            {option.icon} {option.label}
          </Badge>
        </div>
      )
    },
    meta: {
      filter: {
        variant: "multi-select",
        options: statusOptions,
        parser: parseAsArrayOf(parseAsStringEnum(schemas.StatusEnum.options)),
      },
    },
  },
  {
    id: "featured",
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }) => (
      <div className="[&>svg]:size-4">
        {getFeaturedIcon(row.original.featured)}
      </div>
    ),
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="text-end text-green-500">{row.original.price}</div>
    ),
  },
  {
    id: "discount_price",
    accessorKey: "discount_price",
    header: "Discount Price",
    cell: ({ row }) =>
      row.original.discount_price ? (
        <div className="text-amber-500">{row.original.discount_price}</div>
      ) : (
        <div className="text-sm text-muted-foreground">None</div>
      ),
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString()}
      </div>
    ),
  },
] as const satisfies ColumnDef<z.infer<typeof schemas.Product>>[]

function TableCellViewer({
  original: item,
}: {
  original: z.infer<typeof schemas.Product>
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  const form = useProductForm({ item, setOpen })

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
      modal={false}
    >
      <DrawerTrigger asChild>
        <Button size="sm" variant="link">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent
        onAnimationEnd={(e) => {
          if (!open && e.animationName === "slideToRight") {
            form.reset()
          }
        }}
      >
        <DrawerHeader>
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription />
        </DrawerHeader>
        <ProductForm form={form} className="no-scrollbar overflow-y-auto" />
        <DrawerFooter>
          <form.Subscribe
            selector={(state) => [state.isSubmitting, state.isPristine]}
            children={([isSubmitting, isPristine]) => (
              <Button
                form={form.formId}
                type="submit"
                disabled={isSubmitting || isPristine}
              >
                Save changes
              </Button>
            )}
          />
          <DrawerClose asChild>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
