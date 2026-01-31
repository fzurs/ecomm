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
import { useInfiniteQuery } from "@tanstack/react-query";
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
import { apiClient } from "@/lib/api-client";
import { useInfiniteCategories } from "@/lib/query-options";

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
                  <FormControl>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        aria-expanded={open}
                        className="justify-between"
                      >
                        {selectedCategory?.name || "Assing a Category..."}
                        <ChevronDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                  </FormControl>
                  <PopoverContent className="p-0">
                    <CategoryList
                      setOpen={setOpen}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      {...field}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription />
                <FormMessage />
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
  setOpen,
  selectedCategory,
  setSelectedCategory,
  onChange,
}: {
  setOpen: (open: boolean) => void;
  selectedCategory: z.infer<typeof schemas.Category> | null;
  setSelectedCategory: (
    category: z.infer<typeof schemas.Category> | null,
  ) => void;
  onChange?: (id: z.infer<typeof schemas.Category>["id"] | null) => void;
}) {
  const [search, setSearch] = useState("");

  const { data: categories } = useInfiniteCategories({ search });

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search for a Category..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No category results.</CommandEmpty>
        <CommandGroup>
          {categories.map((category) => {
            const selected = category.id === selectedCategory?.id;
            return (
              <CommandItem
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
                <Check
                  className={cn(
                    "ml-auto",
                    selected ? "opacity-100" : "opacity-0",
                  )}
                />
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
