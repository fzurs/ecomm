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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Category, Product, StatusEnum } from "@sdk";
import { cn } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { getCategoriesInfiniteQueryOptions } from "@/lib/queries";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useCallback, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export const statuses: { label: string; value: StatusEnum }[] = [
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "active",
    label: "Active",
  },
  {
    value: "inactive",
    label: "Inactive",
  },
  {
    value: "out_of_stock",
    label: "Out of stock",
  },
  {
    value: "discontinued",
    label: "Discontinued",
  },
];

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
                  value={form.formState.defaultValues?.category as Category}
                  onValueChange={(value) => field.onChange(value?.id)}
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
                    <SelectValue className="Assing status" />
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

export function useInfiniteCategories() {
  const [searchValue, setSearchValue] = useState("");
  const [search, setSearch] = useState("");

  const infiniteQuery = useInfiniteQuery(
    getCategoriesInfiniteQueryOptions([10, undefined, search])
  );

  const categories = useMemo(
    () => infiniteQuery.data?.pages.flatMap((page) => page.results),
    [infiniteQuery.data?.pages]
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (
        infiniteQuery.hasNextPage &&
        target.scrollTop + target.clientHeight >= target.scrollHeight
      ) {
        infiniteQuery.fetchNextPage();
      }
    },
    [infiniteQuery]
  );

  const debounceOnSearchChange = useDebouncedCallback(setSearch, 300);

  return {
    categories,
    handleScroll,
    ...infiniteQuery,
    search: searchValue,
    onSearchChange: (value: string) => {
      setSearchValue(value);
      debounceOnSearchChange(value);
    },
  };
}

function CategorySelect({
  value,
  onValueChange,
}: {
  value?: Category;
  onValueChange?: (value?: Category) => void;
}) {
  const [open, setOpen] = useState(false);

  const [internalValue, setInternalValue] = useState(value);

  const { categories, handleScroll, search, onSearchChange } =
    useInfiniteCategories();

  const onSelect = useCallback(
    (item: Category) => {
      const newValue = internalValue?.id === item.id ? undefined : item;
      onValueChange?.(newValue);
      setInternalValue(newValue);
      setOpen(false);
    },
    [internalValue?.id, onValueChange]
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {internalValue?.name ?? "Select category"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Command className="mt-1 border border-input" shouldFilter={false}>
          <CommandInput
            placeholder="Search category..."
            value={search}
            onValueChange={onSearchChange}
          />
          <CommandList onScroll={handleScroll}>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories?.map((item) => (
                <CommandItem key={item.id} onSelect={() => onSelect(item)}>
                  {item.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      internalValue?.id === item.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CollapsibleContent>
    </Collapsible>
  );
}
