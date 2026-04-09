import { apiClient } from "@/lib/api-client";
import {
  getCategoriesInfiniteQueryOptions,
  getCategoryQueryOptions,
} from "@/lib/query-options";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { schemas } from "@workspace/api-client";
import { Button } from "@workspace/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { ProductForm } from "./form";
import * as u from "@/lib/utils";
import { Badge } from "@workspace/ui/components/badge";

export const columns = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <TableCellViewer original={row.original} />,
    enableColumnFilter: true,
    enableSorting: true,
    meta: {
      variant: "search",
      filterParser: parseAsString,
      placeholder: "Search for a product...",
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground text-sm">
          {row.original.description}
        </div>
      );
    },
  },
  {
    id: "category",
    accessorKey: "Category",
    header: "Category",
    cell: ({ row }) => <div>{row.original.category?.id}</div>,
    enableColumnFilter: true,
    meta: {
      variant: "multiSelect",
      filterParser: parseAsArrayOf(parseAsInteger),
      options: {
        getItemsInfiniteQueryOptions: getCategoriesInfiniteQueryOptions,
        getItemQueryOptions: (value) => getCategoryQueryOptions(Number(value)),
        transformItemToOption: (item: z.infer<typeof schemas.Category>) => {
          return {
            label: item.name,
            value: item.id,
          };
        },
      },
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={"outline"}>
        {u.formatEnumLabel(row.original.status as string)}
      </Badge>
    ),
    enableColumnFilter: true,
    meta: {
      variant: "multiSelect",
      filterParser: parseAsArrayOf(
        parseAsStringEnum(schemas.StatusEnum.options),
      ),
      options: schemas.StatusEnum.options.map((option) => ({
        label: option,
        value: option,
      })),
    },
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => <div className="text-blue-500">{row.original.price}</div>,
    enableColumnFilter: true,
    enableSorting: true,
    meta: {
      variant: "search",
      filterParser: parseAsString,
      placeholder: "Search for a product...",
    },
  },
] as const satisfies ColumnDef<z.infer<typeof schemas.Product>>[];

function TableCellViewer({
  original: item,
}: {
  original: z.infer<typeof schemas.Product>;
}) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(schemas.Product),
    values: item,
  });
  const formId = useId();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof schemas.Product>) =>
      apiClient.products_update(data, { params: { id: item.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
    },
  });

  const onSubmit = (data: z.infer<typeof schemas.Product>) => mutate(data);

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
  );
}
