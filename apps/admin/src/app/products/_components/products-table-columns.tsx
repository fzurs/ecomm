"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@sdk";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./product-form";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { parseAsBoolean, useQueryState } from "nuqs";
import { Copy, Delete, Edit, EllipsisVertical, View } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { productsQueryOptions } from "@/lib/queries";

export const productsTableColumns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Name" column={column} />;
    },
    cell: ({ row }) => {
      return <TableCellViewer product={row.original} />;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] text-muted-foreground truncate">
          {row.original.description}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Category" column={column} />;
    },
    cell: ({ row }) => {
      if (!row.original.category) return null;
      return (
        <Badge variant="outline" className="capitalize">
          {row.original.category.name}
        </Badge>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue(columnId);

      if (!filterValue) return true;

      if (
        cellValue &&
        typeof cellValue === "object" &&
        "slug" in cellValue &&
        typeof cellValue.slug === "string"
      ) {
        return cellValue.slug.toLowerCase().includes(filterValue.toLowerCase());
      }

      return false;
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Price" column={column} />;
    },
    cell: ({ row }) => <div>${Number(row.original.price)}</div>,
  },
  {
    accessorKey: "stock_quantity",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Stock" column={column} />;
    },
    cell: ({ row }) => {
      const stock = row.original.stock_quantity;

      if (!stock) return null;

      function getStockColor(stock: number) {
        let className: string;
        if (stock === 0) {
          className = "bg-red-100 text-red-800 border-red-200";
        } else if (stock <= 5) {
          className = "bg-orange-100 text-orange-800 border-orange-200";
        } else if (stock <= 10) {
          className = "bg-amber-100 text-amber-800 border-amber-200";
        } else {
          className = "bg-green-100 text-green-800 border-green-200";
        }
        return className;
      }

      return <Badge className={cn(getStockColor(stock))}>{stock} units</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created at",
    cell: ({ row }) => {
      return new Date(row.original["created_at"]).toDateString();
    },
    meta: { label: "Created at" },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated at",
    cell: ({ row }) => {
      return new Date(row.original["updated_at"]).toDateString();
    },
    meta: { label: "Updated at" },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <TableColumnAction product={row.original} />;
    },
  },
];

function useViewerSearchParams(id: string) {
  return useQueryState(`viewer_${id}`, parseAsBoolean.withDefault(false));
}

function TableCellViewer({ product }: { product: Product }) {
  const formId = `update-product-form-${product.id}`;
  const [viewerOpen, setViewerOpen] = useViewerSearchParams(product.id);
  const isMobile = useIsMobile();

  const form = useForm<Product>({ defaultValues: product });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Product) =>
      productsApi.productsUpdate(product.id, data).then((res) => res.data),
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries(productsQueryOptions);
      const previousProducts = queryClient.getQueryData<Product[]>(
        productsQueryOptions.queryKey
      );
      queryClient.setQueryData<Product[]>(
        productsQueryOptions.queryKey,
        (old) => {
          if (!old) return old;
          return old.map((item) =>
            newProduct.id === item.id ? newProduct : item
          );
        }
      );
      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      queryClient.setQueryData(
        productsQueryOptions.queryKey,
        context?.previousProducts
      );
    },
    onSettled: () => queryClient.invalidateQueries(productsQueryOptions),
    onSuccess: () => {
      setViewerOpen(false);
    },
  });

  return (
    <Drawer
      open={viewerOpen}
      onOpenChange={setViewerOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        <Button variant="link" className="px-0 text-foreground">
          {product.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{product.name}</DrawerTitle>
          <DrawerDescription className="text-muted-foreground leading-5.5">
            {product.description}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Separator />
          <ProductForm form={form} onSubmit={mutate} formId={formId} />
        </div>
        <DrawerFooter>
          <Button form={formId} disabled={isPending}>
            Save changes
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function TableColumnAction({ product }: { product: Product }) {
  const [open, setOpen] = React.useState(false);
  const setViewerOpen = useViewerSearchParams(product.id)[1];

  const toggleViewer = () => {
    setOpen(false);
    setViewerOpen(true);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size="icon">
          <EllipsisVertical />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleViewer}>
          <View />
          View more
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleViewer}>
          <Edit />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy />
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DestroyDropdownMenuItem product={product}>
          <Delete />
          Delete
        </DestroyDropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DestroyDropdownMenuItem({
  product,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & { product: Product }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => productsApi.productsDestroy(product.id),
    onMutate: async () => {
      await queryClient.cancelQueries(productsQueryOptions);
      const previousProducts = queryClient.getQueryData<Product[]>(
        productsQueryOptions.queryKey
      );
      queryClient.setQueryData<Product[]>(
        productsQueryOptions.queryKey,
        (old) => old?.filter((productOld) => productOld.id !== product.id)
      );
      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      queryClient.setQueryData(
        productsQueryOptions.queryKey,
        context?.previousProducts
      );
    },
    onSettled: () => queryClient.invalidateQueries(productsQueryOptions),
  });

  return (
    <DropdownMenuItem
      onSelect={() => mutate()}
      disabled={isPending}
      {...props}
    />
  );
}
