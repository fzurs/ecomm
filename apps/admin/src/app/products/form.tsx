"use client";

import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { Input } from "@workspace/ui/components/input";
import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Check, ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import { cn } from "@workspace/ui/lib/utils";
import { schemas } from "@workspace/api-client";
import { Button } from "@workspace/ui/components/button";
import { useInfiniteCategories } from "@/lib/query-options";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { formatEnumLabel } from "@/lib/utils";

export function ProductForm({
  form,
  children,
  onSubmit,
  className,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  form: UseFormReturn<z.infer<typeof schemas.Product>>;
  onSubmit: SubmitHandler<z.infer<typeof schemas.Product>>;
}) {
  return (
    <Form {...form}>
      <form
        className={cn("space-y-4", className)}
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
      >
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
          name="category_id"
          render={function Render({ field }) {
            const [open, setOpen] = useState(false);
            const [selectedCategory, setSelectedCategory] = useState<z.infer<
              typeof schemas.Category
            > | null>(form.getValues().category);

            return (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="justify-between"
                        aria-expanded={open}
                      >
                        {selectedCategory?.name ?? "Assing a category..."}
                        <ChevronDown className="opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <CategoryList
                      open={open}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      setOpen={setOpen}
                      onChange={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription />
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          name="status"
          control={form.control}
          render={function Render({ field }) {
            const [open, setOpen] = React.useState(false);

            return (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-between"
                        aria-expanded={open}
                      >
                        {formatEnumLabel(field.value as string) ??
                          "Change status of product..."}
                        <ChevronDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            {schemas.StatusEnum.options.map((status) => (
                              <CommandCheckboxItem
                                key={status}
                                value={status}
                                onSelect={() => {
                                  field.onChange(status);
                                  setOpen(false);
                                }}
                                checked={field.value === status}
                              >
                                {formatEnumLabel(status)}
                              </CommandCheckboxItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
              </FormItem>
            );
          }}
        />
        {children}
      </form>
    </Form>
  );
}

export function CategoryList({
  open,
  setOpen,
  selectedCategory,
  setSelectedCategory,
  onChange,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedCategory: z.infer<typeof schemas.Category> | null;
  setSelectedCategory: (
    category: z.infer<typeof schemas.Category> | null,
  ) => void;
  onChange?: (id: z.infer<typeof schemas.Category>["id"] | null) => void;
}) {
  const [search, setSearch] = useState("");
  const {
    data: categories,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteCategories({ search, open });
  const onScroll = useInfiniteScroll({ hasNextPage, fetchNextPage });

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search for a Category..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList onScroll={onScroll}>
        <CommandEmpty>No category results.</CommandEmpty>
        <CommandGroup>
          {categories.map((category) => {
            const selected = category.id === selectedCategory?.id;
            return (
              <CommandCheckboxItem
                checked={selected}
                key={category.id}
                onSelect={() => {
                  const newCategory = selected ? null : category;
                  setSelectedCategory(newCategory);
                  onChange?.(newCategory?.id ?? null);
                  if (!newCategory) {
                    setOpen(false);
                  }
                }}
                value={category.id.toString()}
              >
                {category.name}
              </CommandCheckboxItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function CommandCheckboxItem({
  children,
  checked,
  ...props
}: React.ComponentProps<typeof CommandItem> & { checked?: boolean }) {
  return (
    <CommandItem {...props}>
      {children}
      <Check className={cn("ml-auto", checked ? "opacity-100" : "opacity-0")} />
    </CommandItem>
  );
}
