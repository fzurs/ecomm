"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@sdk";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CopyPlus,
  EllipsisVertical,
  Loader2,
  PackageMinus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { getProductsQueryOptions } from "@/lib/queries";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useForm } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { ProductForm, statuses } from "./form";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect } from "react";
import { toast } from "sonner";

export const columns: ColumnDef<Product>[] = [
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
    header: ({ column }) => (
      <DataTableColumnHeader title="Name" column={column} />
    ),
    cell: function Cell({ row }) {
      const item = row.original;
      const formId = `viewer-form-${item.id}`;

      const [open, setOpen] = useQueryState(
        `viewer_${item.id}`,
        parseAsBoolean.withDefault(false)
      );

      const isMobile = useIsMobile();
      const queryClient = useQueryClient();

      const form = useForm<Product>({ defaultValues: item });

      // prevents the form from being left with old default values
      useEffect(() => {
        form.reset(item);
      }, [item, form]);

      const { mutate, isPending } = useMutation({
        mutationFn: (data: Product) =>
          productsApi.productsUpdate(item.id, data),
        onSettled: () => {
          queryClient.invalidateQueries(getProductsQueryOptions());
        },
        onSuccess: () => {
          setOpen(false);
        },
      });

      return (
        <Drawer
          open={open}
          onOpenChange={setOpen}
          direction={isMobile ? "bottom" : "right"}
        >
          <DrawerTrigger asChild>
            <Button variant="link" size="sm">
              {item.name}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{item.name}</DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
              <Separator />
              <ProductForm
                form={form}
                onSubmit={form.handleSubmit((data) => mutate(data))}
                id={formId}
              />
            </div>
            <DrawerFooter>
              <Button type="submit" form={formId} disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />} Save
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    },
    meta: {
      variant: "search",
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
    enableColumnFilter: false,
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
    enableColumnFilter: false,
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

      return (
        <Badge className={cn("flex ms-auto", getStockColor(stock))}>
          {stock} units
        </Badge>
      );
    },
    enableColumnFilter: false,
    meta: { label: "Stock" },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader title="Status" column={column} />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.original.status
      );
      if (!status) return null;

      return <Badge variant={"secondary"}>{status.label}</Badge>;
    },
    meta: {
      variant: "status",
    },
  },
  {
    id: "Created at",
    accessorKey: "created_at",
    header: () => <div className="text-right">Created at</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {new Date(row.original.created_at).toDateString()}
      </div>
    ),
    enableColumnFilter: false,
    meta: { label: "Created at" },
  },
  {
    accessorKey: "updated_at",
    header: () => <div className="text-right">Updated at</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {new Date(row.original.updated_at).toDateString()}
      </div>
    ),
    enableColumnFilter: false,
    meta: { label: "Updated at" },
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const product = row.original;
      const productId = row.original.id;

      const queryClient = useQueryClient();

      const createACopyMutation = useMutation({
        mutationFn: () =>
          productsApi
            .productsCreate({
              ...product,
              name: `${product.name} copy`,
              sku: "",
              slug: "",
              category_id: product?.category?.id,
            })
            .then((res) => res.data),
        onError: (err) => {
          toast.error("The product copy could not be created.", {
            description: err.message,
          });
        },
        onSuccess: (data) => {
          toast.success("A copy of the product was successfully created.", {
            description: data.name,
          });
          queryClient.invalidateQueries(getProductsQueryOptions());
        },
      });

      const destroyMutation = useMutation({
        mutationFn: () => productsApi.productsDestroy(productId),
        onMutate: async () => {
          await queryClient.cancelQueries(getProductsQueryOptions());

          const previousData = queryClient
            .getQueryCache()
            .findAll(getProductsQueryOptions())
            .map(({ queryKey }) => ({
              queryKey,
              data: queryClient.getQueryData(queryKey),
            }));

          queryClient
            .getQueryCache()
            .findAll(getProductsQueryOptions())
            .forEach(({ queryKey }) => {
              queryClient.setQueryData(
                queryKey as ReturnType<
                  typeof getProductsQueryOptions
                >["queryKey"],
                (old) =>
                  old && {
                    ...old,
                    results: old.results.filter(
                      (item) => item.id !== productId
                    ),
                  }
              );
            });

          return { previousData };
        },
        onError: (err, _, context) => {
          context?.previousData.forEach(({ queryKey, data }) => {
            queryClient.setQueryData(queryKey, data);
          });
        },
        onSuccess: () => {
          toast.success(`The product "${product.name}" has been destroyed`);
        },
        onSettled: () => {
          queryClient.invalidateQueries(getProductsQueryOptions());
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
                onClick={() => createACopyMutation.mutate()}
                disabled={createACopyMutation.isPending}
              >
                <CopyPlus />
                Create a copy
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
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
