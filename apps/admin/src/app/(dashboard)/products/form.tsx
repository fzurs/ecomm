"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  ArchiveX,
  CheckCircle,
  CircleDotDashed,
  FilePenLine,
  PackageX,
  PauseCircle,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { Brand, Category, Product } from "@workspace/api-client";
import { ProductStatusEnum } from "@workspace/api-client";

import { productStatusOptions } from "@/lib/product-status";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ProductForm({
  form,
  className,
  ...props
}: {
  form: UseFormReturn<Product>;
} & React.ComponentProps<"form">) {
  return (
    <Form {...form}>
      <form className={cn("grid gap-4", className)} {...props}>
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
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription />
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
                <Textarea {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <CategorySelect />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brand_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <BrandSelect
                  original={form.getValues().brand}
                  onBrandIdChange={field.onChange}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {productStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.icon && (
                            <option.icon className={option.iconClassName} />
                          )}
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
