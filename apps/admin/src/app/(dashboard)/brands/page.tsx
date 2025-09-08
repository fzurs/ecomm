"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import * as React from "react";

import { Brand } from "@workspace/api-client";

import { brandsApi } from "@/lib/api";
import { getBrandsQueryOptions } from "@/lib/queries";
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

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { SearchInput, useSearch } from "@/components/search-input";
import { SiteHeader } from "@/components/site-header";

import { columns } from "./columns";
import { BrandForm } from "./form";

export default function Page() {
  const pagination = usePagination()[0];
  const search = useSearch()[0];

  const { data } = useQuery(
    getBrandsQueryOptions({
      limit: pagination.pageSize,
      offset: pagination.pageSize * pagination.pageIndex,
      search,
    }),
  );

  const table = useDataTable({ data, columns });

  return (
    <>
      <SiteHeader title="Brands" />
      <div className="@container/main flex flex-1 flex-col py-4 gap-6 md:py-6">
        <div className="flex flex-col gap-2 md:gap-4 px-4 lg:px-6 md:flex-row-reverse">
          <CreateBrandDialog />
          <div className="flex gap-2 md:gap-4 w-full justify-between">
            <SearchInput
              placeholder="Search for a brand..."
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

function CreateBrandDialog() {
  const [open, setOpen] = React.useState(false);

  const form = useForm<Brand>({ defaultValues: { name: "", website: "" } });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Brand) =>
      brandsApi.brandsCreate({ brand: data }).then((res) => res.data),
    onError: (err) => {
      handleBadRequestError(err, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setOpen(false);
    },
  });

  const onAnimationEnd = () => !open && form.reset();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          New Brand
        </Button>
      </DialogTrigger>
      <DialogContent onAnimationEnd={onAnimationEnd}>
        <DialogHeader>
          <DialogTitle>Create new Brand</DialogTitle>
        </DialogHeader>
        <BrandForm
          form={form}
          onSubmit={form.handleSubmit((data) => mutate(data))}
        >
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </BrandForm>
      </DialogContent>
    </Dialog>
  );
}
