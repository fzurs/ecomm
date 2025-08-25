"use client";

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
import { Product } from "@sdk";
import { UseFormReturn } from "react-hook-form";

export function ProductForm({
  form,
  onSubmit,
  formId,
}: {
  form: UseFormReturn<Product>;
  onSubmit: (data: Product) => void;
  formId?: string;
}) {
  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The product must have a unique name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe a little about the product you want to add."
                  {...field}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                {/* <CategorySelector
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                /> */}
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="150.00"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Give me a number that represents the value of the product in
                dollars.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="10"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                The quantity of products you have in stock.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
