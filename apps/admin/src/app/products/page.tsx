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
import { Check, PackagePlus, Tag } from "lucide-react";
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
import { Category, Product } from "@sdk";
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
import { useCallback, useState } from "react";

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
import { useInfiniteCategories } from "./form";
import { SearchFilter, useSearch } from "@/components/search-filter";

export default function Page() {
  const [category, setCategory] = useState<Category | null>(null);
  const pagination = usePagination()[0];
  const ordering = useOrdering()[0];
  const search = useSearch()[0];

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
          <div className="ml-auto flex gap-2">
            <DataTableViewOptions table={table} />
            <QuickCreateProductDialog />
          </div>
        </div>
        <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <DataTable table={table} />
          <DataTablePagination table={table} />
        </div>
      </div>
    </>
  );
}

function QuickCreateProductDialog() {
  const [open, setOpen] = useState(false);

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
  const [open, setOpen] = useState(false);

  const { categories, handleScroll, search, onSearchChange } =
    useInfiniteCategories();

  const onSelect = useCallback(
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
