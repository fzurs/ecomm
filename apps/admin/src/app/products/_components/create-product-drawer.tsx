"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProductForm } from "./product-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Product } from "@sdk";
import { productsApi } from "@/lib/api";
import { productsQueryOptions } from "@/lib/queries";
import { AlertCircleIcon, PackagePlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { parseAsBoolean, useQueryState } from "nuqs";
import { handleBadRequestError } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formId = "create-product-form";

export function CreateProductDrawer() {
  const isMobile = useIsMobile();

  const [open, setOpen] = useQueryState(
    "new",
    parseAsBoolean.withDefault(false)
  );

  const form = useForm<Product>({
    defaultValues: { name: "", description: "" },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Product) =>
      productsApi.productsCreate(data).then((res) => res.data),
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries(productsQueryOptions);
      const previousProducts = queryClient.getQueryData<Product[]>(
        productsQueryOptions.queryKey
      );
      queryClient.setQueryData<Product[]>(
        productsQueryOptions.queryKey,
        (old) => (old ? [newProduct, ...old] : [newProduct])
      );
      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      queryClient.setQueryData(
        productsQueryOptions.queryKey,
        context?.previousProducts
      );

      handleBadRequestError(err, form.setError);
    },
    onSettled: () => queryClient.invalidateQueries(productsQueryOptions),
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

  async function onSubmit(values: Product) {
    mutate(values);
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        <Button variant="outline" className="size-9 md:w-auto">
          <PackagePlus />
          <span className="sr-only md:not-sr-only">Create new Product</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create new Product</DrawerTitle>
          <DrawerDescription>
            Add a new product to your inventory. Fill in the required fields and
            save it to make it available immediately.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Separator />
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Unable to process your payment.</AlertTitle>
            <AlertDescription>
              <p>Error: {form.formState.errors.root?.message}</p>
            </AlertDescription>
          </Alert>
          <ProductForm form={form} onSubmit={onSubmit} formId={formId} />
        </div>
        <DrawerFooter>
          <Button disabled={isPending} form={formId}>
            Create
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
