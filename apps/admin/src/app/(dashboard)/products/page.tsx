"use client";

import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { PackagePlus, Search } from "lucide-react";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";
import { useForm } from "react-hook-form";
import { useDebounce } from "use-debounce";

import * as React from "react";

import { Category, Product, ProductStatusEnum } from "@workspace/api-client";

import { createProductMutationOptions } from "@/lib/mutations";
import { productStatusOptions } from "@/lib/product-status";
import {
  getCategoriesInfiniteQueryOptions,
  getCategoryQueryOptions,
} from "@/lib/queries/categories";
import { getProductsQueryOptions } from "@/lib/queries/products";
import { getPageCount, handleBadRequestError } from "@/lib/utils";

import {
  parseAsOrdering,
  useCategoryIdSearchParams,
  useGlobalFilterSearchParams,
  usePaginationSearchParams,
  useProductStatusSearchParams,
  useSortingSearchParams,
} from "@/hooks/search-params";

import { Button } from "@/components/ui/button";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import { SubmitButton } from "@/components/custom-ui/submit-button";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  InfiniteSelector,
  InfiniteSelectorContent,
  InfiniteSelectorEmpty,
  InfiniteSelectorGroup,
  InfiniteSelectorInput,
  InfiniteSelectorItem,
  InfiniteSelectorList,
  InfiniteSelectorTrigger,
  InfiniteSelectorValue,
} from "@/components/infinite-selector";
import {
  Selector,
  SelectorContent,
  SelectorEmpty,
  SelectorGroup,
  SelectorInput,
  SelectorItem,
  SelectorList,
  SelectorTrigger,
  SelectorValue,
} from "@/components/selector";
import { SiteHeader } from "@/components/site-header";

import { columns } from "./columns";

export default function Page() {
  const [pagination, setPagination] = usePaginationSearchParams();
  const [sorting, setSorting] = useSortingSearchParams();
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [debouncedSearch] = useDebounce(search, 300);
  const [categoryId, setCategoryId] = useQueryState("category", parseAsInteger);
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringEnum(Object.values(ProductStatusEnum)),
  );

  const { data } = useQuery(
    getProductsQueryOptions({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      ordering: parseAsOrdering.serialize(sorting),
      status: status ?? undefined,
      category: categoryId ?? undefined,
      search: debouncedSearch,
    }),
  );

  const table = useReactTable({
    data: data?.results ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    pageCount: getPageCount(data?.count ?? 0, pagination.pageSize),
    manualSorting: true,
    manualPagination: true,
  });

  return (
    <>
      <SiteHeader title="Products" />
      <div className="@container/main flex flex-1 flex-col p-4 gap-6 md:p-6">
        <div className="flex gap-4">
          <InputGroup>
            <InputGroupInput
              placeholder="Search for a product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
          <InfiniteSelector
            value={categoryId?.toString() ?? ""}
            onValueChange={(value) =>
              setCategoryId(value ? Number(value) : null)
            }
            queryOptions={getCategoriesInfiniteQueryOptions}
          >
            <InfiniteSelectorTrigger>
              <InfiniteSelectorValue
                placeholder="Category"
                resolveQuery={({ value }) =>
                  getCategoryQueryOptions({ id: Number(value) })
                }
                render={(item) => item?.name}
              />
            </InfiniteSelectorTrigger>
            <InfiniteSelectorContent>
              <InfiniteSelectorInput placeholder="Search for a category..." />
              <InfiniteSelectorList>
                <InfiniteSelectorEmpty>
                  No category found.
                </InfiniteSelectorEmpty>
                <InfiniteSelectorGroup
                  render={(products: Category[]) =>
                    products.map((product) => (
                      <InfiniteSelectorItem
                        key={product.id}
                        value={product.id.toString()}
                      >
                        {product.name}
                      </InfiniteSelectorItem>
                    ))
                  }
                />
              </InfiniteSelectorList>
            </InfiniteSelectorContent>
          </InfiniteSelector>
          <Selector
            value={status ?? ""}
            onValueChange={(value) =>
              setStatus(value ? (value as ProductStatusEnum) : null)
            }
          >
            <SelectorTrigger>
              <SelectorValue placeholder="Status" />
            </SelectorTrigger>
            <SelectorContent>
              <SelectorInput placeholder="Search statuses..." />
              <SelectorList>
                <SelectorEmpty>No status found.</SelectorEmpty>
                <SelectorGroup>
                  {productStatusOptions.map((productStatus) => (
                    <SelectorItem
                      key={productStatus.value}
                      value={productStatus.value}
                    >
                      {productStatus.icon && (
                        <productStatus.icon
                          className={productStatus.iconClassName}
                        />
                      )}
                      {productStatus.label}
                    </SelectorItem>
                  ))}
                </SelectorGroup>
              </SelectorList>
            </SelectorContent>
          </Selector>
        </div>
        <div className="relative flex flex-col gap-4">
          <DataTable table={table} />
          <DataTablePagination table={table} />
        </div>
      </div>
    </>
  );
}

function QuickCreateProductDialog() {
  const [open, setOpen] = React.useState(false);

  const form = useForm<Product>({ defaultValues: { name: "" } });
  const formId = React.useId();

  const { mutate, isPending } = useMutation({
    ...createProductMutationOptions,
    onError: (error, variables, context) => {
      createProductMutationOptions.onError?.(error, variables, context);
      handleBadRequestError(error, form);
    },
    onSuccess: (data, variables, context) => {
      createProductMutationOptions.onSuccess?.(data, variables, context);
      setOpen(false);
    },
  });

  const onAnimationEnd = () => !open && form.reset();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
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
            onSubmit={form.handleSubmit((product) => mutate({ product }))}
            id={formId}
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
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <SubmitButton
            form={formId}
            isLoading={isPending}
            loadingState="Creating..."
          >
            Create
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
