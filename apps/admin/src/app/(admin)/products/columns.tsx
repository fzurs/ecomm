import { apiClient } from "@/lib/api-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { schemas } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { parseAsArrayOf, parseAsString, parseAsStringEnum } from "nuqs"
import { useId, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ProductForm } from "./form"
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

export function getStatusIcon(
  status: (typeof schemas.StatusEnum.options)[number]
): React.ReactNode {
  switch (status) {
    case "active":
      return <IconCircleDashedCheck className="text-green-500" />
    case "inactive":
      return <IconCircleDashedX className="text-red-500" />
    case "draft":
      return <IconLoader />
    case "out_of_stock":
      return <IconPackageOff className="text-orange-500" />
    case "discontinued":
      return <IconTrashX className="text-red-500" />
    default:
      return null
  }
}

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
      filter: { variant: "categories", parser: parseAsArrayOf(parseAsString) },
    },
  },
  {
    id: "brand",
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => row.original.brand?.name,
    meta: {
      filter: { variant: "brands", parser: parseAsArrayOf(parseAsString) },
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <div className="flex justify-end">
          {status && (
            <Badge variant={"outline"}>
              {getStatusIcon(status)} {snakeCaseToTitle(status)}{" "}
            </Badge>
          )}
        </div>
      )
    },
    meta: {
      filter: {
        variant: "statuses",
        parser: parseAsArrayOf(parseAsStringEnum(schemas.StatusEnum.options)),
      },
    },
  },
  {
    id: "featured",
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }) =>
      row.original.featured ? (
        <IconStar className="size-4 fill-yellow-500 text-yellow-500" />
      ) : (
        <IconStar className="size-4" />
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
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(schemas.Product),
    values: item,
  })
  const formId = useId()

  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof schemas.Product>) =>
      apiClient.products_update(data, {
        params: { slug: item.slug as string },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setOpen(false)
    },
  })

  const onSubmit = (data: z.infer<typeof schemas.Product>) => mutate(data)

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
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{item.name}</DrawerTitle>
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto">
          <ProductForm
            form={form}
            id={formId}
            onSubmit={onSubmit}
            className="px-4"
          />
        </div>
        <DrawerFooter>
          <Button type="submit" disabled={isPending} form={formId}>
            Save changes
          </Button>
          <DrawerClose asChild>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
