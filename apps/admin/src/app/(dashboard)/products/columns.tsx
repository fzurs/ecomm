"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArchiveX,
  CheckCircle,
  CopyPlus,
  EllipsisVertical,
  FilePenLine,
  PackageMinus,
  PackageX,
  PauseCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import * as React from "react";

import {
  PatchedProduct,
  Product,
  ProductStatusEnum,
} from "@workspace/api-client";

import { productsApi } from "@/lib/apis";
import { handleError } from "@/lib/handle-error";

import { useIsMobile } from "@/hooks/use-mobile";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
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

import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Spinner } from "@/components/spinner";

import { ProductForm } from "./form";

const schema = z.object({
  id: z.string().readonly(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  category_id: z.number().optional().nullable(),
  brand_id: z.number().optional().nullable(),
  sku: z.string(),
  slug: z.string(),
  price: z.string().optional(),
  stock_quantity: z.number().optional(),
  status: z.enum(Object.values(ProductStatusEnum)),
  created_at: z.date(),
  updated_at: z.date(),
});

type TTDatta = z.infer<typeof schema>;
type L = Product;

export const statuses = [
  { value: ProductStatusEnum.Active, label: "Active", icon: CheckCircle },
  {
    value: ProductStatusEnum.OutOfStock,
    label: "Out of stock",
    icon: PackageX,
  },
  { value: ProductStatusEnum.Inactive, label: "Inactive", icon: PauseCircle },
  {
    value: ProductStatusEnum.Discontinued,
    label: "Discontinued",
    icon: ArchiveX,
  },
  { value: ProductStatusEnum.Draft, label: "Draft", icon: FilePenLine },
];

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader title="Name" column={column} />
    ),
    cell: function TableCellViewer({ row }) {
      const item = row.original;
      const isMobile = useIsMobile();
      const [open, setOpen] = React.useState(false);

      const queryClient = useQueryClient();

      const form = useForm({ resolver: zodResolver(schema), values: item });
      const formId = React.useId();

      const { mutate, isPending } = useMutation({
        mutationFn: (data: PatchedProduct) =>
          productsApi.productsPartialUpdate({
            id: item.id,
            patchedProduct: data,
          }),
        onError: (error) => {
          const message = handleError(error, form);
          toast.error("Fail to update product.", {
            description: message,
            position: "bottom-left",
          });
        },
        onSuccess: () => {
          setOpen(false);
          queryClient.invalidateQueries({ queryKey: ["products"] });
        },
      });

      return (
        <Drawer
          direction={isMobile ? "bottom" : "right"}
          open={open}
          onOpenChange={setOpen}
          modal={false}
        >
          <DrawerTrigger asChild>
            <Button variant="link" size="sm">
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
              onSubmit={form.handleSubmit((data) => mutate(data))}
              className="px-4"
            />
            <DrawerFooter>
              <Button type="submit" form={formId} disabled={isPending}>
                {isPending && <Spinner />}Save changes
              </Button>
              <DrawerClose asChild>
                <Button variant="secondary">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    },
    meta: { variant: "globalFilter", placeholder: "Search for a product..." },
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
      const value = row.original.status;
      const status = statuses.find((priority) => priority.value === value);

      if (!status) return null;

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
    meta: {
      variant: "select",
      label: "Status",
      placeholder: "Filters statuses...",
      options: statuses,
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
    cell: function TableCellActions({ row }) {
      const item = row.original;
      const queryClient = useQueryClient();

      const destroyMutation = useMutation({
        mutationFn: () => productsApi.productsDestroy({ id: item.id }),
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
          productsApi.productsDuplicateCreate({ id: item.id, product: item }),
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
