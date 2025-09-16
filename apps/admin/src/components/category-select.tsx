"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";

import * as React from "react";

import { Category } from "@workspace/api-client";

import { getCategoriesInfiniteQueryOptions } from "@/lib/queries";
import { cn } from "@/lib/utils";

import { DebouncedCommandInput } from "./debounced-command-input";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function CategoryList({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
}) {
  const [search, setSearch] = React.useState("");

  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery(
    getCategoriesInfiniteQueryOptions({
      limit: 30,
      search,
    }),
  );

  return (
    <Command shouldFilter={false}>
      <DebouncedCommandInput
        placeholder="Search for a category..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList
        onScroll={(e) => {
          const target = e.currentTarget;
          if (
            hasNextPage &&
            target.scrollTop + target.clientHeight >= target.scrollHeight
          ) {
            fetchNextPage();
          }
        }}
      >
        <CommandEmpty>No category found.</CommandEmpty>
        <CommandGroup>
          {data?.pages
            .flatMap((page) => page.results)
            ?.map((category) => (
              <CommandItem
                key={category.id}
                onSelect={() =>
                  setSelectedCategory(
                    category.id !== selectedCategory?.id ? category : null,
                  )
                }
              >
                {category.name}
                <Check
                  className={cn(
                    "ml-auto",
                    selectedCategory?.id === category.id
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

export function CategorySelect({
  category,
  onCategoryChange,
}: {
  category?: Category | null;
  onCategoryChange?: (value: Category | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] =
    React.useState<Category | null>(category ?? null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          {selectedCategory?.name ?? "Assign a category"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <CategoryList
          selectedCategory={selectedCategory}
          setSelectedCategory={(category) => {
            setSelectedCategory(category);
            onCategoryChange?.(category);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
