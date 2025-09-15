"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, ListFilter } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { Category } from "@workspace/api-client";

import { getCategoriesInfiniteQueryOptions } from "@/lib/queries";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const PAGE_SIZE = 30;

export function useInfiniteCategories() {
  const [search, setSearch] = React.useState("");
  const [searchInternal, setSearchInternal] = React.useState("");

  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery(
    getCategoriesInfiniteQueryOptions({ limit: PAGE_SIZE, search }),
  );

  const categories = React.useMemo(
    () => data?.pages.flatMap((page) => page.results),
    [data?.pages],
  );

  const onScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
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

  const onSearchChange = React.useCallback(
    (value: string) => {
      setSearchInternal(value);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch],
  );

  return { categories, onScroll, search: searchInternal, onSearchChange };
}

export function CategoryList({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory?: Category;
  setSelectedCategory?: (category?: Category) => void;
}) {
  const { categories, onScroll, search, onSearchChange } =
    useInfiniteCategories();

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search for a category..."
        value={search}
        onValueChange={onSearchChange}
      />
      <CommandList onScroll={onScroll}>
        <CommandEmpty>No category found.</CommandEmpty>
        <CommandGroup>
          {categories?.map((category) => (
            <CommandItem
              key={category.slug}
              onSelect={() =>
                setSelectedCategory?.(
                  selectedCategory?.slug === category.slug
                    ? undefined
                    : category,
                )
              }
            >
              {category.name}
              <Check
                className={cn(
                  "ml-auto",
                  selectedCategory?.slug === category.slug
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
  onCategoryIdChange,
}: {
  category?: Category;
  onCategoryIdChange?: (id?: Category["slug"]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<
    Category | undefined
  >(category);

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
            onCategoryIdChange?.(category?.slug);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
