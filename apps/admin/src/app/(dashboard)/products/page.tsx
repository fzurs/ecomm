"use client";

import {
  InfiniteData,
  QueryKey,
  QueryOptions,
  UndefinedInitialDataInfiniteOptions,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseQueryOptions,
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Column,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AxiosResponse, all } from "axios";
import { Check, ChevronDown, Loader2, PackagePlus, X } from "lucide-react";
import {
  ParserBuilder,
  createParser,
  parseAsArrayOf,
  parseAsIndex,
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import {
  Brand,
  CategoriesApiCategoriesListRequest,
  Category,
  PaginatedBrandList,
  PaginatedCategoryList,
  PaginatedProductList,
  Product,
  ProductStatusEnum,
  ProductsApiProductsListRequest,
} from "@workspace/api-client";

import { brandsApi, categoriesApi, productsApi } from "@/lib/api";
import {
  getBrandQueryOptionsOnce,
  getBrandsInfiniteQueryOptions,
  getCategoriesInfiniteQueryOptions,
  getCategoryQueryOptionsOnce,
} from "@/lib/queries";
import { cn, handleBadRequestError } from "@/lib/utils";

import {
  parseAsSort,
  useDataTable,
  useGlobalFilterSearchParams,
  usePaginationSearchParams,
  useSortingSearchParams,
} from "@/hooks/use-data-table";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
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

import {
  DebouncedCommandInput,
  InfiniteCommand,
  InfiniteCommandInput,
  InfiniteCommandList,
  InfiniteCommandOptions,
  SelectableCommandItem,
} from "@/components/ui-extra/command";
import { IdBasedSelect } from "@/components/ui-extra/id-based-select";
import { SelectItem, SelectValue } from "@/components/ui-extra/select";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { DebouncedInput } from "@/components/debounced-input";
import { SearchInput, useSearch } from "@/components/search-input";
import { SiteHeader } from "@/components/site-header";

import { columns } from "./columns";
import { BrandList, CategoryList, statusOptions } from "./form";

const getProductsQueryOptions = (
  params: Parameters<typeof productsApi.productsList>[0],
) =>
  queryOptions({
    queryKey: [productsApi.productsList.name, params],
    queryFn: () => productsApi.productsList(params).then((res) => res.data),
    placeholderData: keepPreviousData,
  });

const getCategoryByIdQueryOptions = (id: Category["id"]) =>
  queryOptions({
    queryKey: ["categories", id],
    queryFn: () =>
      categoriesApi.categoriesRetrieve({ id }).then((res) => res.data),
  });

const getBrandByIdQueryOptions = (id: Brand["id"]) =>
  queryOptions({
    queryKey: ["brands", id],
    queryFn: () => brandsApi.brandsRetrieve({ id }).then((res) => res.data),
  });

export default function Page() {
  const { pageIndex, pageSize } = usePaginationSearchParams()[0];
  const sorting = useSortingSearchParams()[0];
  const globalFilter = useGlobalFilterSearchParams()[0];

  const [categoryId, setCategoryId] = useQueryState("category", parseAsInteger);
  const [brandId, setBrandId] = useQueryState("brand", parseAsInteger);

  const { data } = useQuery(
    getProductsQueryOptions({
      limit: pageSize,
      offset: pageIndex * pageSize,
      ordering: parseAsSort.serialize(sorting),
      search: globalFilter,
    }),
  );

  const table = useDataTable({ data, columns });

  return (
    <>
      <SiteHeader title="Products" />
      <div className="@container/main flex flex-1 flex-col p-4 gap-6 md:p-6">
        <QuickCreateProductDialog />
        <DebouncedInput
          value={table.getState().globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />
        <CategoryIdBasedSelect
          value={categoryId}
          onValueChange={setCategoryId}
        />
        <BrandIdBasedSelect value={brandId} onValueChange={setBrandId} />
        <div className="relative flex flex-col gap-4">
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

function CategoryIdBasedSelect({
  getByIdQueryOptions = getCategoryByIdQueryOptions,
  ...props
}: React.ComponentProps<typeof IdBasedSelect<Category>>) {
  return (
    <IdBasedSelect getByIdQueryOptions={getByIdQueryOptions} {...props}>
      <IdBasedSelectTrigger asChild>
        <Button variant="outline">
          <SelectValue<Category>>
            {(value) => value?.name || "Category"}
          </SelectValue>
        </Button>
      </IdBasedSelectTrigger>
      <IdBasedSelectContent className="p-0">
        <InfiniteCommand
          queryOptions={(search) =>
            getCategoriesInfiniteQueryOptions({ search })
          }
        >
          <InfiniteCommandInput placeholder="Search for a category..." />
          <InfiniteCommandList>
            <CommandEmpty>No categories found.</CommandEmpty>
            <InfiniteCommandOptions<PaginatedCategoryList>>
              {({ data }) => {
                const options = React.useMemo(
                  () => data?.pages.flatMap((page) => page.results) ?? [],
                  [data],
                );
                return options.map((item) => (
                  <IdBasedSelectItem key={item.id}>
                    <CommandItem>{item.name}</CommandItem>
                  </IdBasedSelectItem>
                ));
              }}
            </InfiniteCommandOptions>
          </InfiniteCommandList>
        </InfiniteCommand>
      </IdBasedSelectContent>
    </IdBasedSelect>
  );
}

function BrandIdBasedSelect({
  getByIdQueryOptions = getBrandByIdQueryOptions,
  ...props
}: React.ComponentProps<typeof IdBasedSelect<Brand>>) {
  return (
    <IdBasedSelect getByIdQueryOptions={getByIdQueryOptions} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <SelectValue<Brand>>
              {(value) => value?.name || "Brand"}
            </SelectValue>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <InfiniteCommand
            queryOptions={(search) => getBrandsInfiniteQueryOptions({ search })}
          >
            <InfiniteCommandInput placeholder="Search for a brand..." />
            <InfiniteCommandList>
              <CommandEmpty>No brands found.</CommandEmpty>
              <InfiniteCommandOptions<PaginatedBrandList>>
                {({ data }) => {
                  const options = React.useMemo(
                    () => data?.pages.flatMap((page) => page.results) ?? [],
                    [data],
                  );
                  return options.map((item) => (
                    <SelectItem key={item.id} value={item}>
                      {item.name}
                    </SelectItem>
                  ));
                }}
              </InfiniteCommandOptions>
            </InfiniteCommandList>
          </InfiniteCommand>
        </PopoverContent>
      </Popover>
    </IdBasedSelect>
  );
}
