"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table } from "@tanstack/react-table";
import {
  Check,
  CircleDashed,
  CircleDotDashed,
  PackageMinus,
  PackagePlus,
  Tags,
  X,
} from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import * as React from "react";

import { Category, Product, StatusEnum } from "@sdk";

import { statuses, statusesValueLabel } from "@/config/constants";

import { productsApi } from "@/lib/api";
import { getProductsQueryOptions } from "@/lib/queries";
import { cn, handleBadRequestError } from "@/lib/utils";

import {
  useDataTable,
  useOrdering,
  usePagination,
} from "@/hooks/use-data-table";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";

import { DataTable } from "@/components/data-table/data-table";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarClose,
  DataTableActionBarSelection,
  DataTableActionBarSeparator,
} from "@/components/data-table/data-table-action-bar";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { SearchFilter, useSearch } from "@/components/search-filter";
import { SiteHeader } from "@/components/site-header";

import { columns } from "./columns";
import { CategoryList } from "./form";

function useStatus() {
  return useQueryState("status", parseAsStringEnum(Object.values(StatusEnum)));
}

export default function Page() {
  const [category, setCategory] = React.useState<Category>();
  const pagination = usePagination()[0];
  const ordering = useOrdering()[0];
  const [search, setSearch] = useSearch();
  const [status, setStatus] = useStatus();

  const { data, isError } = useQuery(
    getProductsQueryOptions([
      category?.id,
      pagination.pageSize,
      pagination.pageIndex * pagination.pageSize,
      ordering ?? undefined,
      search ?? undefined,
      status ?? undefined,
    ]),
  );

  const table = useDataTable({
    data,
    columns,
  });

  const isFiltered = !!search || !!category || !!status;

  function resetFilters() {
    setSearch(null);
    setCategory(undefined);
    setStatus(null);
  }

  return (
    <>
      <SiteHeader items={[{ label: "Products" }]} />
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex gap-2 px-4 lg:px-6 justify-between">
          <div className="flex flex-1 flex-wrap gap-2">
            <SearchFilter placeholder="Search products..." />
            <CategoryFilter category={category} setCategory={setCategory} />
            <StatusFilter />
            {isFiltered && (
              <Button variant="ghost" onClick={resetFilters}>
                <X />
                <span className="sr-only md:not-sr-only">Reset</span>
              </Button>
            )}
          </div>
          <div className="flex flex-wrap-reverse justify-end h-fit gap-2">
            <DataTableViewOptions table={table} />
            <QuickCreateProductDialog />
          </div>
        </div>
        <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <DataTable table={table} />
          <DataTablePagination table={table} />
        </div>
        <ProductsTableActionBar table={table} />
      </div>
    </>
  );
}

function ProductsTableActionBar({ table }: { table: Table<Product> }) {
  const rows = table.getSelectedRowModel().rows;
  const productIds = rows.map((row) => row.original.id);

  const queryClient = useQueryClient();

  const destroyMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      await Promise.all(
        productIds.map((id) => productsApi.productsDestroy(id)),
      );
    },
    onError: () => {
      toast.error("Failed to destroy the selected products.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(getProductsQueryOptions());
      toast.success("The selected products were successfully removed.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      productIds,
      status,
    }: {
      productIds: string[];
      status: StatusEnum;
    }) => {
      await Promise.all(
        productIds.map((id) =>
          productsApi.productsPartialUpdate(id, { status }),
        ),
      );
    },
    onError: () => {
      toast.error(
        "An error occurred while trying to update the status of the products.",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(getProductsQueryOptions());
      toast.success("They were updated successfully.");
    },
  });

  return (
    <DataTableActionBar table={table}>
      <DataTableActionBarSelection table={table} />
      <DataTableActionBarSeparator />
      <Select
        onValueChange={(status: StatusEnum) =>
          updateMutation.mutate({
            productIds,
            status,
          })
        }
      >
        <SelectPrimitive.SelectTrigger asChild>
          <DataTableActionBarAction tooltip="Update status">
            <CircleDashed className="opacity-50" />
            Status
          </DataTableActionBarAction>
        </SelectPrimitive.SelectTrigger>
        <SelectContent className="p-0 w-fit">
          <SelectGroup>
            {statuses.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <DataTableActionBarAction
        variant="destructive"
        tooltip="Destroy products"
        onClick={() => destroyMutation.mutate(productIds)}
      >
        <PackageMinus />
        Destroy
      </DataTableActionBarAction>
      <DataTableActionBarSeparator />
      <DataTableActionBarClose table={table} />
    </DataTableActionBar>
  );
}

function QuickCreateProductDialog() {
  const [open, setOpen] = React.useState(false);

  const queryClient = useQueryClient();

  const form = useForm<Product>({ defaultValues: { name: "" } });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Product) =>
      productsApi.productsCreate(data).then((res) => res.data),
    onSettled: () => {
      queryClient.invalidateQueries(getProductsQueryOptions());
    },
    onError: (err) => {
      handleBadRequestError(err, form.setError);
    },
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="size-9 md:w-auto">
          <PackagePlus />
          <span className="sr-only md:not-sr-only">Create new Product</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new Product</DialogTitle>
          <DialogDescription>
            Create one quickly and then enrich it
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit((data) => mutate(data))}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>The name must be unique</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CategoryFilter({
  category,
  setCategory,
}: {
  category?: Category;
  setCategory?: (category?: Category) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const onSelectCategory = React.useCallback(
    (newCategory: Category) => {
      setCategory?.(category?.id === newCategory.id ? undefined : newCategory);
      setOpen(false);
    },
    [setCategory, category?.id],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          <Tags className="opacity-50" />
          {category?.name ?? "Category"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]" align="start">
        <CategoryList
          selectedCategory={category}
          onSelectCategory={onSelectCategory}
        />
      </PopoverContent>
    </Popover>
  );
}

function StatusFilter() {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = useStatus();

  const currentStatus = status && statusesValueLabel[status];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="justify-between">
          {!currentStatus ? (
            <>
              <CircleDashed className="opacity-50" />
              Status
            </>
          ) : (
            <>
              {currentStatus.icon ? (
                <currentStatus.icon />
              ) : (
                <CircleDotDashed />
              )}
              {currentStatus.label}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-fit" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {statuses.map(({ value, label }) => (
                <CommandItem
                  key={value}
                  value={value}
                  onSelect={() => {
                    setStatus(value === status ? null : value);
                    setOpen(false);
                  }}
                >
                  {label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === status ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
