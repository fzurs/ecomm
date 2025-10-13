"use client";

import { UseFormReturn } from "react-hook-form";

import * as React from "react";

import { Product } from "@workspace/api-client";

import { getCategoriesInfiniteQueryOptions } from "@/lib/queries/categories";
import { cn } from "@/lib/utils";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  SelectorContent,
  SelectorControl,
  SelectorDebouncedInput,
  SelectorGroup,
  SelectorInfiniteOptions,
  SelectorInfiniteScrollList,
  SelectorTrigger,
} from "@/components/selector";
import {
  TSelector,
  TSelectorItem,
  TSelectorValue,
} from "@/components/t-selector";

import { statuses } from "./columns";

export function ProductForm({
  form,
  className,
  ...props
}: React.ComponentProps<"form"> & { form: UseFormReturn<Product> }) {
  return (
    <Form {...form}>
      <form className={cn("space-y-8", className)} {...props}>
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Assing a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.icon && <status.icon />}
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <TSelector
                original={form.getValues().category}
                onValueChange={field.onChange}
                renderItem={(item) => item.name}
              >
                <FormControl>
                  <SelectorTrigger>
                    <TSelectorValue placeholder="Assing a category..." />
                  </SelectorTrigger>
                </FormControl>
                <SelectorContent align="center">
                  <SelectorControl shouldFilter={false}>
                    <SelectorInfiniteOptions
                      options={getCategoriesInfiniteQueryOptions}
                    >
                      {(categories) => (
                        <>
                          <SelectorDebouncedInput placeholder="Search for a category..." />
                          <SelectorInfiniteScrollList>
                            <SelectorGroup>
                              {categories.map((category) => (
                                <TSelectorItem
                                  key={category.id}
                                  item={category}
                                >
                                  {category.name}
                                </TSelectorItem>
                              ))}
                            </SelectorGroup>
                          </SelectorInfiniteScrollList>
                        </>
                      )}
                    </SelectorInfiniteOptions>
                  </SelectorControl>
                </SelectorContent>
              </TSelector>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
