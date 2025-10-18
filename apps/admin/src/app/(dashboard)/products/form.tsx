"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useDebounce } from "use-debounce";

import * as React from "react";

import { Product } from "@workspace/api-client";

import { getCategoriesInfiniteQueryOptions } from "@/lib/query-options.categories";
import { cn } from "@/lib/utils";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { statuses } from "./columns";

export function ProductForm({
  form,
  className,
  ...props
}: React.ComponentProps<"form"> & { form: UseFormReturn<Product> }) {
  return (
    <Form {...form}>
      <form className={cn("space-y-4", className)} {...props}>
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
          render={function Render({ field }) {
            const [open, setOpen] = React.useState(false);
            const [search, setSearch] = React.useState("");
            const [debouncedSearch] = useDebounce(search, 300);
            const [selectedItem, setSelectedItem] = React.useState(
              form.getValues().category ? form.getValues().category : null,
            );

            const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
              ...getCategoriesInfiniteQueryOptions({
                search: debouncedSearch ?? undefined,
              }),
              enabled: open,
            });
            const categories = React.useMemo(
              () => data?.pages.flatMap((page) => page.results) ?? [],
              [data],
            );

            const onScroll = useInfiniteScroll(hasNextPage, fetchNextPage);

            return (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <FormControl>
                    <PopoverTrigger asChild>
                      <Button
                        role="combobox"
                        aria-expanded={open}
                        variant="outline"
                        className="justify-between"
                      >
                        {selectedItem?.name || "Assing a category..."}
                        <ChevronDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                  </FormControl>
                  <PopoverContent className="p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Filter categories..."
                        value={search}
                        onValueChange={setSearch}
                      />
                      <CommandList onScroll={onScroll}>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          {categories.map((category) => (
                            <CommandItem
                              key={category.id}
                              value={category.id.toString()}
                              onSelect={() => {
                                setSelectedItem(category);
                                field.onChange(category.id);
                                setOpen(false);
                              }}
                            >
                              {category.name}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  selectedItem?.id === category.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription />
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </form>
    </Form>
  );
}
