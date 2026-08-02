import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
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
import { Badge } from "@workspace/ui/components/badge"
import {
  IconCircleDashedCheck,
  IconCircleDashedX,
  IconLoader,
  IconPackageOff,
  IconStar,
  IconTrashX,
} from "@tabler/icons-react"

import { ProductForm, useProductForm } from "./form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { format } from "date-fns"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

import {
  PaginatedProductList,
  Product,
  ProductStatus,
} from "@workspace/api-client"
import {
  productsDestroyMutation,
  productsListQueryKey,
} from "@workspace/api-client/query"
import { EllipsisVerticalIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { zProductStatus } from "@workspace/api-client/zod"
import { capitalize } from "@/lib/utils"

const featuredIcons = {
  true: <IconStar className="fill-yellow-500 text-yellow-500" />,
  false: <IconStar className="text-muted-foreground" />,
} as const

export const statusIcons: Record<ProductStatus, React.JSX.Element> = {
  active: <IconCircleDashedCheck className="text-green-500" />,
  inactive: <IconCircleDashedX className="text-red-500" />,
  draft: <IconLoader />,
  out_of_stock: <IconPackageOff className="text-orange-500" />,
  discontinued: <IconTrashX className="text-red-500" />,
}

export const statusOptions = zProductStatus.options.map((status) => ({
  label: capitalize(status.replaceAll("_", " ")),
  value: status,
}))

export function ProductImagePreview({ product }: { product?: Product }) {
  return (
    <Avatar className="aspect-square size-full max-w-92 min-w-44 rounded-md">
      <AvatarImage src={product?.image ?? undefined} />
      <AvatarFallback className="rounded-md">
        {product?.image ? "Fail to load" : "No image"}
      </AvatarFallback>
    </Avatar>
  )
}

export const columns = [
  {
    accessorKey: "Image",
    cell: ({ row }) => <ProductImagePreview product={row.original} />,
    meta: { thClassName: "text-center" },
  },
  {
    accessorKey: "sku",
    meta: { className: "text-muted-foreground font-medium" },
  },
  {
    accessorKey: "name",
    cell: ({ row }) => <TableCellViewer original={row.original} />,
    enableHiding: false,
    meta: { variant: "text", thClassName: "pl-5" },
  },
  {
    accessorKey: "description",
    cell: ({ row }) => (
      <div className="min-w-sm text-pretty text-muted-foreground">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "category",
    cell: ({ row }) =>
      row.original.category && (
        <Badge variant="secondary">{row.original.category.name}</Badge>
      ),
    meta: { thClassName: "pl-4" },
  },
  {
    accessorKey: "brand",
    cell: ({ row }) => row.original.brand?.name,
  },
  {
    accessorKey: "status",
    cell: ({ row }) =>
      row.original.status && (
        <Badge variant="outline" className="capitalize">
          {statusIcons[row.original.status]}{" "}
          {row.original.status.replaceAll("_", " ")}
        </Badge>
      ),
    meta: {
      thClassName: "pl-4",
      variant: "multi-select",
      options: statusOptions,
    },
  },
  {
    accessorKey: "featured",
    cell: ({ row }) => featuredIcons[row.original.featured ? "true" : "false"],
    meta: {
      thClassName: "text-center",
      className: "[&>svg]:size-4 [&>svg]:mx-auto",
      variant: "boolean",
      options: [
        { label: "Featured", value: "true" },
        { label: "Not Featured", value: "false" },
      ],
    },
  },
  {
    accessorKey: "price",
    meta: {
      thClassName: "text-right",
      className: "text-right text-green-500",
      variant: "range",
    },
  },
  {
    accessorKey: "discount_price",
    header: "Discount",
    meta: {
      thClassName: "text-left",
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
    cell: ({ row }) => <TableCellActions item={row.original} />,
    enableHiding: false,
    meta: { className: "text-right" },
  },
] as const satisfies ColumnDef<Product>[]

function TableCellViewer({ original: item }: { original: Product }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

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
        <div className="overflow-auto px-4 pb-4">
          <ProductForm form={form} />
        </div>
        <DrawerFooter>
          <form.AppForm>
            <form.Submit>Save changes</form.Submit>
          </form.AppForm>
          <DrawerClose asChild>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function TableCellActions({ item }: { item: Product }) {
  const { onDestroy } = useOptimisticProductDestroy(item)

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="ghost" aria-label="Open actions">
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive">
                <Trash2Icon />
                Delete product
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete product?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDestroy}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function useOptimisticProductDestroy(item: Product) {
  const queryClient = useQueryClient()

  const queryKey = productsListQueryKey()

  const mutation = useMutation({
    ...productsDestroyMutation(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueriesData(
        { queryKey },
        (old: PaginatedProductList | undefined) => {
          if (!old) return old
          return {
            ...old,
            results: old.results.filter((product) => product.id !== item.id),
          }
        }
      )

      return { previousData }
    },
    onError: (err, _, onMutateResult) => {
      queryClient.setQueryData(queryKey, onMutateResult?.previousData)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  const onDestroy = () =>
    mutation.mutate({ path: { slug: item.slug as string } })

  return { mutation, onDestroy }
}
