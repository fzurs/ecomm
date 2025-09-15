"use client";

import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Check,
  Circle,
  CircleDashed,
  CircleSmall,
  List,
  ListFilter,
  Loader2,
  PackagePlus,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { useForm } from "react-hook-form";

import * as React from "react";

import { Brand, Category, Product } from "@workspace/api-client";

import { statusEnum, statusList, statuses } from "@/config/constants";

import { brandsApi, categoriesApi, productsApi } from "@/lib/api";
import {
  getCategoryQueryOptions,
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
  CommandGroup,
  CommandInput,
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

import { BrandList } from "@/components/brand-select";
import { CategoryList } from "@/components/category-select";
import { DataTable } from "@/components/data-table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table-view-options";
import { SearchInput, useSearch } from "@/components/search-input";
import { SiteHeader } from "@/components/site-header";

import { columns } from "./columns";

function useCategory() {
  return useQueryState("category", parseAsInteger);
}

function useStatus() {
  return useQueryState("status", parseAsStringEnum(statusList));
}

function useBrand() {
  return useQueryState("brand", parseAsInteger);
}

export default function Page() {
  const pagination = usePagination()[0];
  const ordering = useOrdering()[0];
  const search = useSearch()[0];

  const status = useStatus()[0];
  const category = useCategory()[0];
  const brand = useBrand()[0];

  const { data } = useQuery(
    getProductsQueryOptions({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      ordering,
      search,
      category: category ?? undefined,
      status: status ?? undefined,
      brand: brand ?? undefined,
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
            <div className="flex gap-2 md:gap-4">
              <SearchInput
                placeholder="Search for a product..."
                className="md:max-w-92"
              />
              <CategoryFilter />
              <BrandFilter />
              <StatusFilter />
              <Button variant={"ghost"} onClick={() => {}}>
                <X />
                Reset
              </Button>
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

function CategoryFilter() {
  const [categoryId, setCategoryId] = useCategory();
  const [selectedCategory, setSelectedCategory] = React.useState<Category>();

  const { data, isLoading } = useQuery({
    queryKey: ["categories", categoryId],
    queryFn: () =>
      categoriesApi
        .categoriesRetrieve({ id: categoryId as number })
        .then((res) => res.data),
    enabled: !!categoryId && !selectedCategory,
    staleTime: Infinity,
    retry: 0,
  });

  React.useEffect(() => {
    if (data) setSelectedCategory(data);
  }, [data]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"}>
          <List />
          {selectedCategory
            ? selectedCategory.name
            : isLoading
              ? "Loading..."
              : "Category"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <CategoryList
          selectedCategory={selectedCategory}
          setSelectedCategory={(value) => {
            setSelectedCategory(value);
            setCategoryId(value?.id ?? null);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function BrandFilter() {
  const [brandId, setBrandId] = useBrand();
  const [selectedBrand, setSelectedBrand] = React.useState<Brand>();

  const { data, isLoading } = useQuery({
    queryKey: ["brands", brandId],
    queryFn: () =>
      brandsApi
        .brandsRetrieve({ id: brandId as number })
        .then((res) => res.data),
    enabled: !!brandId && !selectedBrand,
    staleTime: Infinity,
    retry: 0,
  });

  React.useEffect(() => {
    if (data) setSelectedBrand(data);
  }, [data]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"}>
          <Award />
          {selectedBrand
            ? selectedBrand.name
            : isLoading
              ? "Loading..."
              : "Brand"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <BrandList
          selectedBrand={selectedBrand}
          setSelectedBrand={(value) => {
            setSelectedBrand(value);
            setBrandId(value?.id ?? null);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function StatusFilter() {
  const [open, setOpen] = React.useState(false);
  const [statusValue, setStatusValue] = useStatus();

  const currentStatus = statusValue && statusEnum[statusValue];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={"outline"}>
          {currentStatus ? (
            <>
              {currentStatus.icon && (
                <currentStatus.icon className={currentStatus.iconClassName} />
              )}
              {currentStatus.label}
            </>
          ) : (
            <>
              <CircleDashed />
              Status
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command>
          <CommandInput placeholder="Search for a status" />
          <CommandGroup>
            <CommandList>
              {statuses.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  onSelect={() => {
                    setStatusValue(
                      status.value === statusValue ? null : status.value,
                    );
                    setOpen(false);
                  }}
                >
                  {status.icon && (
                    <status.icon className={status.iconClassName} />
                  )}
                  {status.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      statusValue === status.value
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
