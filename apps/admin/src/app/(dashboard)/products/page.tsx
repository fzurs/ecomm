"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { PackagePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import * as React from "react";

import { ProductStatusEnum } from "@workspace/api-client";
import { Product } from "@workspace/api-client";

import { productsApi } from "@/lib/apis";
import { getProductsQueryOptions } from "@/lib/query-options.products";
import { useColumnFiltersSearchParams } from "@/lib/search-params.column-filters";
import { useSearch } from "@/lib/search-params.global-filter";
import { useLimitOffsetSearchParams } from "@/lib/search-params.pagination";
import { useOrderingSearchParams } from "@/lib/search-params.sorting";

import { useDataTable } from "@/hooks/use-data-table";

import { Button } from "@/components/ui/button";
import {
  Dialog,
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

import { DataTable } from "@/components/data-table";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/spinner";

import { columns } from "./columns";

export default function ProductsPage() {
  const { limit, offset } = useLimitOffsetSearchParams();
  const { ordering } = useOrderingSearchParams();
  const [search] = useSearch();
  const [columnFilters] = useColumnFiltersSearchParams();
  const status = columnFilters.find(
    (columnFilter) => columnFilter.id === "status",
  )?.value as ProductStatusEnum | undefined;

  const { data } = useQuery(
    getProductsQueryOptions({ limit, offset, ordering, search, status }),
  );

  const table = useDataTable({ data, columns });

  return (
    <>
      <SiteHeader title="Products" />
      <div className="py-4 md:py-6">
        <DataTable table={table}>
          <DataTableToolbar table={table}>
            <QuickCreateProductDialog />
          </DataTableToolbar>
        </DataTable>
      </div>
    </>
  );
}

const formSchema = z.object({ name: z.string().nonempty() });

export function QuickCreateProductDialog() {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });
  const formId = React.useId();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) =>
      productsApi.productsCreate({ product: data as Product }),
    onError: (error) => {
      const isBadRequest =
        isAxiosError(error) && error.response?.status === 400;
      toast.error("Failed to create product.", {
        description: isBadRequest
          ? error.response?.data["name"][0]
          : "Please check the entered data and try again.",
      });
    },
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const onAnimationEnd = () => !open && form.reset();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PackagePlus />
          Add new Product
        </Button>
      </DialogTrigger>
      <DialogContent onAnimationEnd={onAnimationEnd}>
        <DialogHeader>
          <DialogTitle>Add new Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutate(data))}
            id={formId}
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
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
          <Button type="submit" form={formId}>
            {isPending && <Spinner />}
            {isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
