"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  useDataTable,
  useOrdering,
  usePagination,
} from "@/hooks/use-data-table";
import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { SiteHeader } from "@/components/site-header";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { getProductsQueryOptions } from "@/lib/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Check,
  CircleCheck,
  PackageMinus,
  PackagePlus,
  Tag,
  X,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Category, Product, StatusEnum } from "@sdk";
import { Input } from "@/components/ui/input";
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
import { productsApi } from "@/lib/api";
import { cn, handleBadRequestError } from "@/lib/utils";
import * as React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { statuses, useInfiniteCategories } from "./form";
import { SearchFilter, useSearch } from "@/components/search-filter";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarClose,
  DataTableActionBarSelection,
  DataTableActionBarSeparator,
} from "@/components/data-table/data-table-action-bar";
import { Table } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import { toast } from "sonner";

export default function Page() {
  const [category, setCategory] = React.useState<Category | null>(null);
  const pagination = usePagination()[0];
  const ordering = useOrdering()[0];
  const [search, setSearch] = useSearch();

  const { data } = useQuery(
    getProductsQueryOptions([
      category?.id,
      pagination.pageSize,
      pagination.pageIndex * pagination.pageSize,
      ordering ?? undefined,
      search ?? undefined,
    ])
  );

  const table = useDataTable({
    data,
    columns,
  });

  return (
    <>
      <SiteHeader items={[{ label: "Products" }]} />
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex gap-2 px-4 lg:px-6">
          <SearchFilter placeholder="Search products..." />
          <CategoryFilter value={category} onValueChange={setCategory} />
          {!!search ||
            (!!category && (
              <Button
                variant="ghost"
                className="border-2 border-dashed"
                onClick={() => {
                  setSearch(null);
                  setCategory(null);
                }}
              >
                <X />
                Reset
              </Button>
            ))}
          <div className="ml-auto flex gap-2">
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
  const productIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id);

  const queryClient = useQueryClient();

  const destroyMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      let errorCount = 0;
      await Promise.all(
        productIds.map((id) =>
          productsApi.productsDestroy(id).catch(() => (errorCount += 1))
        )
      );
      return { errorCount };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(getProductsQueryOptions());
      if (data.errorCount) {
        toast.info("Not all of them could be eliminated.");
      } else {
        toast.success("The selected products were successfully removed.");
      }
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
      let errorCount = 0;
      await Promise.all(
        productIds.map((id) =>
          productsApi
            .productsPartialUpdate(id, { status })
            .catch(() => (errorCount += 1))
        )
      );
      return { errorCount };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(getProductsQueryOptions());
      if (data.errorCount) {
        toast.info("Some failed to update the status.");
      } else {
        toast.success("They were updated successfully.");
      }
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
        <SelectTrigger asChild>
          <DataTableActionBarAction tooltip="Update status">
            <CircleCheck />
            Status
          </DataTableActionBarAction>
        </SelectTrigger>
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
        <Button variant="outline">
          <PackagePlus />
          Create new Product
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
  value,
  onValueChange,
}: {
  value: Category | null;
  onValueChange: (value: Category | null) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const { categories, handleScroll, search, onSearchChange } =
    useInfiniteCategories();

  const onSelect = React.useCallback(
    (item: Category) => {
      const newValue = value?.id === item.id ? null : item;
      onValueChange(newValue);
      setOpen(false);
    },
    [onValueChange, value?.id]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value?.name ?? "Filter by category"}
          <Tag />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={onSearchChange}
            placeholder="Search category..."
          />
          <CommandList onScroll={handleScroll}>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories?.map((item) => (
                <CommandItem key={item.id} onSelect={() => onSelect(item)}>
                  {item.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      value?.id === item.id ? "opacity-100" : "opacity-0"
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
