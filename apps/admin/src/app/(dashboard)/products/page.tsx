"use client";

import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Loader2, PackagePlus, X } from "lucide-react";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { useForm } from "react-hook-form";

import * as React from "react";

import {
  Brand,
  Category,
  Product,
  ProductStatusEnum,
} from "@workspace/api-client";

import { productsApi } from "@/lib/api";
import {
  getBrandQueryOptionsOnce,
  getCategoryQueryOptionsOnce,
  getProductsQueryOptions,
} from "@/lib/queries";
import { cn, handleBadRequestError } from "@/lib/utils";

import {
  useDataTable,
  useOrdering,
  usePagination,
} from "@/hooks/use-data-table";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
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

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { SearchInput, useSearch } from "@/components/search-input";
import { SiteHeader } from "@/components/site-header";

import { columns } from "./columns";
import { BrandList, CategoryList, statusOptions } from "./form";

export default function Page() {
  const pagination = usePagination()[0];
  const ordering = useOrdering()[0];
  const search = useSearch()[0];

  const [categoryId, setCategoryId] = useCategoryId();
  const [brandId, setBrandId] = useBrandId();
  const [status, setStatus] = useStatus();

  const hasFilters = !!(categoryId || brandId || status);
  const resetFilters = () => {
    setCategoryId(null);
    setBrandId(null);
    setStatus(null);
  };

  const { data } = useQuery(
    getProductsQueryOptions({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      ordering,
      search,
      category: categoryId || undefined,
      brand: brandId || undefined,
      status: status || undefined,
    }),
  );

  const table = useDataTable({
    data,
    columns,
  });

  return (
    <>
      <SiteHeader title="Products" />
      <div className="@container/main flex flex-1 flex-col py-4 gap-6 md:py-6">
        <div className="flex flex-col gap-2 md:gap-4 px-4 lg:px-6 md:flex-row-reverse">
          <QuickCreateProductDialog />
          <div className="flex gap-2 md:gap-4 w-full justify-between">
            <SearchInput placeholder="Search for a product..." />
            <div className="flex flex-wrap w-full gap-2 md:gap-4">
              <CategoryFilter />
              <BrandFilter />
              <StatusFilter />
              {hasFilters && (
                <Button variant="ghost" onClick={resetFilters}>
                  <X />
                  Reset
                </Button>
              )}
            </div>
            <DataTableViewOptions table={table} />
          </div>
        </div>
        <div className="relative flex flex-col gap-4 px-4 lg:px-6">
          <DataTable table={table} />
          <DataTablePagination table={table} />
        </div>
      </div>
    </>
  );
}

function QuickCreateProductDialog({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);

  const queryClient = useQueryClient();

  const form = useForm<Product>({ defaultValues: { name: "" } });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Product) =>
      productsApi.productsCreate({ product: data }),
    onError: (err) => {
      handleBadRequestError(err, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
    },
  });

  const onAnimationEnd = () => !open && form.reset();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <PackagePlus />
          New Product
        </Button>
      </DialogTrigger>
      <DialogContent onAnimationEnd={onAnimationEnd}>
        <DialogHeader>
          <DialogTitle>Create new Product</DialogTitle>
          <DialogDescription />
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
                  <FormLabel>
                    Name<span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                {isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function useCategoryId() {
  return useQueryState("category", parseAsInteger);
}

function CategoryFilter() {
  const [categoryId, setCategoryId] = useCategoryId();

  const [open, setOpen] = React.useState(false);

  const [selectedCategory, setSelectedCategory] =
    React.useState<Category | null>(null);

  const { data } = useQuery(
    getCategoryQueryOptionsOnce(categoryId, selectedCategory),
  );

  React.useEffect(() => {
    if (data) {
      setSelectedCategory(data);
    } else if (!categoryId) {
      setSelectedCategory(null);
    }
  }, [data, categoryId]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          {selectedCategory?.name || "Category"}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <CategoryList
          selectedCategory={selectedCategory}
          onCategorySelect={(category) => {
            setSelectedCategory(category);
            setCategoryId(category?.id || null);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function useBrandId() {
  return useQueryState("brand", parseAsInteger);
}

function BrandFilter() {
  const [brandId, setBrandId] = useBrandId();

  const [open, setOpen] = React.useState(false);

  const [selectedBrand, setSelectedBrand] = React.useState<Brand | null>(null);

  const { data } = useQuery(getBrandQueryOptionsOnce(brandId, selectedBrand));

  React.useEffect(() => {
    if (data) {
      setSelectedBrand(data);
    } else if (!brandId) {
      setSelectedBrand(null);
    }
  }, [data, brandId]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          {selectedBrand?.name || "Brand"}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <BrandList
          selectedBrand={selectedBrand}
          onBrandSelect={(brand) => {
            setSelectedBrand(brand);
            setBrandId(brand?.id || null);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function useStatus() {
  return useQueryState(
    "status",
    parseAsStringEnum(Object.values(ProductStatusEnum)),
  );
}

export function StatusFilter() {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = useStatus();

  const currentStatusOption = statusOptions.find(
    ({ value }) => value === status,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {currentStatusOption ? (
            <>
              {currentStatusOption.icon}
              {currentStatusOption.label}
            </>
          ) : (
            "Status"
          )}
          <ChevronDown className="opacity-50 ms-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {statusOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    setStatus(option.value !== status ? option.value : null);
                    setOpen(false);
                  }}
                >
                  {option.icon}
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      status === option.value ? "opacity-100" : "opacity-0",
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
