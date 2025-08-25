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
import { productsApi } from "@/lib/api/client";
import { productsQueryOptions } from "@/lib/api/products";
import { PackagePlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const formId = __filename;

export function CreateProductDrawer() {
  const isMobile = useIsMobile();

  const form = useForm<Product>({ defaultValues: { name: "" } });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (product: Product) =>
      productsApi.productsCreate(product).then((res) => res.data),
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries(productsQueryOptions);
      const previousProducts = queryClient.getQueryData<Product[]>(
        productsQueryOptions.queryKey
      );
      queryClient.setQueryData<Product[]>(
        productsQueryOptions.queryKey,
        (old) => (old ? [...old, newProduct] : [newProduct])
      );
      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      queryClient.setQueryData(
        productsQueryOptions.queryKey,
        context?.previousProducts
      );
    },
    onSettled: () => queryClient.invalidateQueries(productsQueryOptions),
  });

  function onSubmit(values: Product) {
    mutate(values);
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
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
