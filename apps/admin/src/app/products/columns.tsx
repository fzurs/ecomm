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
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs"
import { useId, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ProductForm } from "./form"
import { snakeCaseToTitle } from "@/lib/utils"
import { Badge } from "@workspace/ui/components/badge"
import {
  getCategoriesQueryOptions,
  getCategoryQueryOptions,
} from "@/lib/query-options"

export const columns = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name", // este accessor key hace que mi filtro desaparesca cuando no esta (?)
    cell: ({ row }) => <TableCellViewer original={row.original} />,
    // enableColumnFilter: true,
    enableSorting: true,
    meta: {
      filter: { variant: "text", parser: parseAsString.withDefault("") },
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
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
    enableColumnFilter: true,
    meta: {
      filter: {
        variant: "async-multi-select",
        queryOptions: getCategoriesQueryOptions(),
        getItemQueryOptions: (filterValue) =>
          getCategoryQueryOptions({ id: filterValue }),
        itemToStringLabel: (item) => item.name,
        itemToStringValue: (item) => String(item.id),
        isItemEqualToValue: (a, b) => a.id === b.id,
        parser: parseAsArrayOf(parseAsInteger).withDefault([]),
      },
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.status && (
        <Badge variant={"outline"}>
          {snakeCaseToTitle(row.original.status)}
        </Badge>
      ),
    // enableColumnFilter: true,
    meta: {
      filter: {
        variant: "combobox",
        items: [
          { id: 1, name: "Cat1" },
          { id: 2, name: "Cat2" },
        ],
        itemToStringLabel: (item: { name: string }) => item.name,
        itemToStringValue: (item: { id: number }) => item.id.toString(),
        parser: parseAsInteger,
      },
    },
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="text-blue-500">{row.original.price}</div>
    ),
    enableSorting: true,
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
      apiClient.products_update(data, { params: { id: item.id } }),
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
        <ProductForm
          form={form}
          id={formId}
          onSubmit={onSubmit}
          className="px-4"
        />
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
