"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import * as React from "react";

import { Category } from "@workspace/api-client";

import { categoriesApi } from "@/lib/api";
import { getCategoriesQueryOptions } from "@/lib/queries";
import { handleBadRequestError } from "@/lib/utils";

import { useDataTable, usePagination } from "@/hooks/use-data-table";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
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

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { SearchInput, useSearch } from "@/components/search-input";
import { SiteHeader } from "@/components/site-header";

import { columns } from "./columns";

export default function Page() {
  const pagination = usePagination()[0];
  const search = useSearch()[0];

  const { data } = useQuery(
    getCategoriesQueryOptions({
      limit: pagination.pageSize,
      offset: pagination.pageSize * pagination.pageIndex,
      search,
    }),
  );

  const table = useDataTable({ data, columns });

  return (
    <>
      <SiteHeader title="Categories" />
      <div className="@container/main flex flex-1 flex-col py-4 gap-6 md:py-6">
        <div className="flex flex-col gap-2 md:gap-4 px-4 lg:px-6 md:flex-row-reverse">
          <QuickCreateCategoryDialog />
          <div className="flex gap-2 md:gap-4 w-full justify-between">
            <SearchInput
              placeholder="Search for a category..."
              className="md:max-w-92"
            />
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

function QuickCreateCategoryDialog() {
  const [open, setOpen] = React.useState(false);

  const form = useForm<Category>({ defaultValues: { name: "" } });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Category) =>
      categoriesApi
        .categoriesCreate({ category: data })
        .then((res) => res.data),
    onError: (err) => {
      handleBadRequestError(err, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(getCategoriesQueryOptions());
      setOpen(false);
    },
  });

  const onAnimationEnd = () => !open && form.reset();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          New Category
        </Button>
      </DialogTrigger>
      <DialogContent onAnimationEnd={onAnimationEnd}>
        <DialogHeader>
          <DialogTitle>Create new Category</DialogTitle>
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
                  <FormDescription />
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
