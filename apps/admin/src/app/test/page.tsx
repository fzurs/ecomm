"use client";

import { DataTable } from "@/components/data-table/data-table";
import {
  PageAction,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page-header";
import { useColumnFilterValues } from "@/hooks/use-column-filters";
import { useDataTable } from "@/hooks/use-data-table";
import { usePaginationValues } from "@/hooks/use-pagination";
import { useSortingValues } from "@/hooks/use-sorting";
import { apiClient } from "@/lib/api-client";
import { useProducts } from "@/lib/query-options";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { schemas } from "@workspace/api-client";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { PackagePlus } from "lucide-react";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { columns } from "./columns";

export default function Page() {
  const pagination = usePaginationValues();
  const { ...columnFilters } = useColumnFilterValues(columns);
  const sorting = useSortingValues();
  const { data } = useProducts({
    ...pagination,
    ...columnFilters,
    ...sorting,
  });
  const table = useDataTable({ data, columns });

  return (
    <>
      <PageHeader>
        <PageTitle>Products</PageTitle>
        <PageAction>
          <QuickCreateProductDialog />
        </PageAction>
      </PageHeader>
      <PageContent>
        <DataTable table={table} />
      </PageContent>
    </>
  );
}

function QuickCreateProductDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(schemas.Product),
    defaultValues: { id: 0, category: null, name: "" },
  });
  const formId = useId();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof schemas.Product>) =>
      apiClient.products_create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
    },
  });

  const onSubmit = (values: z.infer<typeof schemas.Product>) => {
    mutate(values);
  };

  const onAnimationEnd = () => !open && form.reset();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PackagePlus />
          Quick Create Product
        </Button>
      </DialogTrigger>
      <DialogContent onAnimationEnd={onAnimationEnd}>
        <DialogHeader>
          <DialogTitle>Quick create new Product</DialogTitle>
          <DialogDescription className="sr-only">
            Create a product so quickly
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id={formId}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input required {...field} />
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
          <Button type="submit" disabled={isPending} form={formId}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
