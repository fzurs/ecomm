import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
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
  IconDots,
  IconLoader,
  IconPackageOff,
  IconStar,
  IconTrash,
  IconTrashX,
} from "@tabler/icons-react"
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
} from "nuqs"
import {
  getBrandsQueryOptions,
  getCategoriesQueryOptions,
  queryKeys,
  selectAsOption,
} from "@/lib/query-options"
import { ProductForm, useProductForm } from "./form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { apiClient } from "@/lib/api-client"
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
import { cn } from "@workspace/ui/lib/utils"

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
    enableHiding: false,
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
        variant: "async-multi",
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
        variant: "async-multi",
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
    meta: {
      filter: {
        variant: "select",
        options: [
          { label: "Featured", value: true, icon: getFeaturedIcon(true) },
          { label: "Not Featured", value: false, icon: getFeaturedIcon(false) },
        ],
        parser: parseAsBoolean,
      },
    },
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.original.price
      const isEmpty = price === null || price === undefined

      return (
        <div
          className={cn(
            "text-end",
            isEmpty ? "text-muted-foreground" : "text-green-500"
          )}
        >
          {isEmpty ? "-" : price}
        </div>
      )
    },
  },
  {
    id: "discount_price",
    accessorKey: "discount_price",
    header: "Discount Price",
    cell: ({ row }) => {
      const discount_price = row.original.discount_price
      const isEmpty =
        discount_price === null ||
        discount_price === undefined ||
        discount_price === 0

      return (
        <div
          className={cn(isEmpty ? "text-muted-foreground" : "text-amber-500")}
        >
          {isEmpty ? "-" : discount_price}
        </div>
      )
    },
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
  {
    id: "actions",
    cell: ({ row }) => <TableCellActions item={row.original} />,
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

function TableCellActions({ item }: { item: z.infer<typeof schemas.Product> }) {
  const queryClient = useQueryClient()

  const destroyMutation = useMutation({
    mutationFn: () =>
      apiClient.products_destroy(undefined, {
        params: { slug: item.slug as string },
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all() })

      const previousData = queryClient.getQueryData(queryKeys.products.list())

      queryClient.setQueriesData(
        { queryKey: queryKeys.products.all() },
        (
          old: Awaited<ReturnType<typeof apiClient.products_list>> | undefined
        ) => {
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
      queryClient.setQueryData(
        queryKeys.products.list(),
        onMutateResult?.previousData
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() })
    },
  })

  return (
    <div className="flex justify-end">
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <IconDots />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem variant="destructive">
                  <IconTrash />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <IconTrash />
            </AlertDialogMedia>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Once deleted, there is no going back; the item will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => destroyMutation.mutate()}
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
