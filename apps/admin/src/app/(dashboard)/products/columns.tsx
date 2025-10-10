"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  CopyPlus,
  EllipsisVertical,
  Loader2,
  PackageMinus,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import * as React from "react";

import { Product } from "@workspace/api-client";

import { productsApi } from "@/lib/apis";
import { productStatusConfig } from "@/lib/product-status";
import { handleBadRequestError } from "@/lib/utils";

import { useIsMobile } from "@/hooks/use-mobile";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import { ProductForm } from "./form";

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader title="Name" column={column} />
    ),
    cell: function Cell({ row }) {
      const product = row.original;
      const formId = `update-form-${product.id}`;

      const [open, setOpen] = React.useState(false);

      const isMobile = useIsMobile();
      const queryClient = useQueryClient();

      const form = useForm<Product>({ defaultValues: product });

      const { mutate, isPending } = useMutation({
        mutationFn: (data: Product) =>
          productsApi.productsUpdate({ product: data, id: product.id }),
        onError: (err) => {
          handleBadRequestError(err, form);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          setOpen(false);
        },
      });

      return (
        <Drawer
          open={open}
          onOpenChange={setOpen}
          direction={isMobile ? "bottom" : "right"}
          modal={false} // category combobox scroll
        >
          <DrawerTrigger asChild>
            <Button variant="link" size="sm">
              {product.name}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{product.name}</DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <ProductForm
              form={form}
              onSubmit={form.handleSubmit((data) => mutate(data))}
              id={formId}
              className="px-4 overflow-auto"
            />
            <DrawerFooter>
              <Button type="submit" form={formId} disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                {isPending ? "Saving..." : "Save"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) =>
      row.original.description && (
        <div className="max-w-[200px] text-muted-foreground truncate">
          {row.original.description}
        </div>
      ),
    meta: {
      variant: "text",
      placeholder: "Description",
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) =>
      row.original.category && (
        <Badge variant="outline">{row.original.category.name}</Badge>
      ),
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) =>
      row.original.brand && (
        <Badge variant="secondary">{row.original.brand.name}</Badge>
      ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader
        title="Status"
        column={column}
        className="flex mx-auto"
      />
    ),
    cell: ({ row }) => {
      if (!row.original.status) return null;
      const status = productStatusConfig[row.original.status];
      return (
        <Badge
          variant="outline"
          className="text-muted-foreground px-1.5 mx-auto flex"
        >
          {status.icon && <status.icon />}
          {status.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader
        title="Price"
        column={column}
        className="flex ms-auto"
      />
    ),
    cell: ({ row }) => {
      const price = row.original.price;
      if (!price) return null;

      const priceFloat = parseFloat(price);

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(priceFloat);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "stock_quantity",
    header: ({ column }) => (
      <DataTableColumnHeader
        title="Stock"
        column={column}
        className="flex ms-auto"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.stock_quantity} units</div>
    ),
    meta: { label: "Stock" },
  },
  {
    id: "Created at",
    accessorKey: "created_at",
    header: () => <div className="text-right">Created at</div>,
    cell: ({ row }) => (
      <div className="text-right text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString(undefined, {
          day: "2-digit",
          year: "numeric",
          month: "long",
        })}
      </div>
    ),
    meta: { label: "Created at" },
  },
  {
    accessorKey: "updated_at",
    header: () => <div className="text-right">Updated at</div>,
    cell: ({ row }) => (
      <div className="text-right text-muted-foreground">
        {new Date(row.original.updated_at).toLocaleDateString(undefined, {
          day: "2-digit",
          weekday: "long",
          year: "numeric",
          month: "long",
          hour: "numeric",
          minute: "numeric",
        })}
      </div>
    ),
    meta: { label: "Updated at" },
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const product = row.original;
      const queryClient = useQueryClient();

      const destroyMutation = useMutation({
        mutationFn: () => productsApi.productsDestroy({ id: product.id }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          toast.success("Product destroyed");
        },
        onError: () => {
          toast.error("The product could not be destroyed");
        },
      });

      const duplicateMutation = useMutation({
        mutationFn: () =>
          productsApi.productsDuplicateCreate({ id: product.id, product }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          toast.success("Product duplicated");
        },
        onError: () => {
          toast.error("The product could not be duplicated");
        },
      });

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => duplicateMutation.mutate()}
                disabled={duplicateMutation.isPending}
              >
                <CopyPlus />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => destroyMutation.mutate()}
                disabled={destroyMutation.isPending}
                variant="destructive"
              >
                <PackageMinus />
                Destroy
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
