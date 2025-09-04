"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { Category, Product } from "@workspace/typescript-axios-client";

import { statuses } from "@/config/constants";

import { getCategoriesInfiniteQueryOptions } from "@/lib/queries";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
                <CategorySelect
                  original={form.formState.defaultValues?.category as Category}
                  onCategoryChange={(category) => field.onChange(category?.id)}
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
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {statuses.map(({ label, value }) => (
                        <SelectItem key={value} value={value}>
                          {label}
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

function CategorySelect({
  original,
  onCategoryChange,
}: {
  original?: Category;
  onCategoryChange?: (category?: Category) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState(original);

  const onSelectCategory = React.useCallback(
    (category: Category) => {
      const newSelectedCategory =
        selectedCategory?.id === category.id ? undefined : category;
      onCategoryChange?.(newSelectedCategory);
      setSelectedCategory(newSelectedCategory);
      setOpen(false);
    },
    [selectedCategory?.id, onCategoryChange],
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedCategory?.name ?? "Select a category"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 h-72">
        <CategoryList
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}

export function CategoryList({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory?: Category;
  onSelectCategory?: (category: Category) => void;
}) {
  const [search, setSearch] = React.useState("");

  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery(
    getCategoriesInfiniteQueryOptions([10, undefined, search]),
  );

  const categories = React.useMemo(
    () => data?.pages.flatMap((page) => page.results),
    [data?.pages],
  );

  const onScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (
        hasNextPage &&
        target.scrollTop + target.clientHeight >= target.scrollHeight
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, fetchNextPage],
  );

  const debouncedSetSearch = useDebouncedCallback(setSearch, 300);

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search category..."
        onValueChange={debouncedSetSearch}
      />
      <CommandList onScroll={onScroll}>
        <CommandEmpty>No category found.</CommandEmpty>
        <CommandGroup>
          {categories?.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => onSelectCategory?.(item)}
            >
              {item.name}
              <Check
                className={cn(
                  "ml-auto",
                  selectedCategory?.id === item.id
                    ? "opacity-100"
                    : "opacity-0",
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
