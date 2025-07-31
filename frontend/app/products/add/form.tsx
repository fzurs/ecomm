"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/lib/api";
import { productsApi } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileDiffIcon, SaveIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const sampleProduct: Product = {
  id: 123,
  title: "Producto de Prueba",
  description:
    "Este producto es una prueba de la funcionalidad al agregar nuevo poductos a la base de datos.",
  price: "2200.00",
};

export function AddProductForm() {
  const form = useForm<Product>({
    defaultValues: { id: 123, title: "", description: "", img: "", price: "" },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: Product) => {
      console.log(values);

      const data = { ...values, isTest: true };

      localStorage.setItem("testNewProduct", JSON.stringify(data));
      return values;
    },
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({
        queryKey: [productsApi.productsList.name],
      });

      const previousData = queryClient.getQueryData([
        productsApi.productsList.name,
      ]) as Product[];

      queryClient.setQueryData(
        [productsApi.productsList.name],
        (old: Product[] | undefined) => (old ? [newProduct, ...old] : null)
      );

      return { previousData };
    },
    onSuccess: (data) => {
      toast(`Se creo un nuevo producto! se llama: ${data.title}`);
    },
    onError: (err, newProduct, context) => {
      queryClient.setQueryData(
        [productsApi.productsList.name],
        context?.previousData
      );
      toast.error("Algo salio mal.", { description: err.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [productsApi.productsList.name],
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutate(values))}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titulo</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="img"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen</FormLabel>
              <FormControl>
                <Input
                  disabled
                  type="file"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Este input esta desabilitado para no ocupar tanto lugar en la
                memoria
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio (en pesos)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="100.00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stockeado</FormLabel>
              <FormControl>
                <Checkbox checked disabled />
              </FormControl>
              <FormDescription>
                Muestra si esta disponible para el inventario
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-6">
          <Button size="lg" disabled={isPending}>
            <SaveIcon />
            Guardar producto en memoria local
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              form.reset();
              Object.keys(sampleProduct).map((key) => {
                const value = sampleProduct[key as keyof Product];
                form.setValue(key as keyof Product, value);
              });
              toast("Se argego el producto de prueba a los campos!");
            }}
          >
            <FileDiffIcon />
            Rellenar los campos con un producto de prueba
          </Button>
        </div>
      </form>
    </Form>
  );
}
