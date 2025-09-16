"use client";

import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, PackagePlus, X } from "lucide-react";
import { useForm } from "react-hook-form";

import * as React from "react";

import { Product } from "@workspace/api-client";

import { productsApi } from "@/lib/api";
import { getProductsQueryOptions } from "@/lib/queries";
import { cn, handleBadRequestError } from "@/lib/utils";

import {
  useDataTable,
  useOrderingSearchParams,
  usePaginationSearchParams,
} from "@/hooks/use-data-table";

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

import { BrandFilter, useBrandSearchParams } from "@/components/brand-filter";
import {
  CategoryFilter,
  useCategorySearchParams,
} from "@/components/category-filter";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { SearchFilter, useSearch } from "@/components/search-filter";
import { SiteHeader } from "@/components/site-header";
import {
  StatusFilter,
  useStatusSearchParams,
} from "@/components/status-filter";

import { columns } from "./columns";

export default function Page() {
  const pagination = usePaginationSearchParams()[0];
  const ordering = useOrderingSearchParams()[0];
  const search = useSearch()[0];

  const [categoryId, setCategoryId] = useCategorySearchParams();
  const [status, setStatus] = useStatusSearchParams();
  const [brandId, setBrandId] = useBrandSearchParams();

  const { data } = useQuery(
    getProductsQueryOptions({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      ordering,
      search,
      category: categoryId ?? undefined,
      status: status ?? undefined,
      brand: brandId ?? undefined,
    }),
  );

  const table = useDataTable({
    data,
    columns,
  });

  const hasFilters = !!categoryId || !!status || !!brandId;
  const resetFilters = () => {
    setCategoryId(null);
    setStatus(null);
    setBrandId(null);
  };

  return (
    <>
      <SiteHeader title="Products" />
      <div className="@container/main flex flex-1 flex-col py-4 gap-6 md:py-6">
        <div className="flex flex-col gap-2 md:gap-4 px-4 lg:px-6 md:flex-row-reverse">
          <QuickCreateProductDialog />
          <div className="flex gap-2 md:gap-4 w-full justify-between">
            <SearchFilter placeholder="Search for a product..." />
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
