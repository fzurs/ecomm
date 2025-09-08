"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { Brand } from "@workspace/api-client";

import { getBrandsInfiniteQueryOptions } from "@/lib/queries";
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

export function useInfiniteBrands() {
  const [search, setSearch] = React.useState("");
  const [searchInternal, setSearchInternal] = React.useState("");

  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery(
    getBrandsInfiniteQueryOptions({ limit: PAGE_SIZE, search }),
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

export function BrandList({
  selectedBrand,
  setSelectedBrand,
}: {
  selectedBrand?: Brand;
  setSelectedBrand?: (brand?: Brand) => void;
}) {
  const { categories, onScroll, search, onSearchChange } = useInfiniteBrands();

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search for a brand..."
        value={search}
        onValueChange={onSearchChange}
      />
      <CommandList onScroll={onScroll}>
        <CommandEmpty>No brand found.</CommandEmpty>
        <CommandGroup>
          {categories?.map((brand) => (
            <CommandItem
              key={brand.id}
              onSelect={() =>
                setSelectedBrand?.(
                  selectedBrand?.id === brand.id ? undefined : brand,
                )
              }
            >
              {brand.name}
              <Check
                className={cn(
                  "ml-auto",
                  selectedBrand?.id === brand.id ? "opacity-100" : "opacity-0",
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function BrandSelect({
  brand,
  onBrandIdChange,
}: {
  brand?: Brand;
  onBrandIdChange?: (id?: Brand["id"]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedBrand, setSelectedBrand] = React.useState<Brand | undefined>(
    brand,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          {selectedBrand?.name ?? "Assign a brand"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <BrandList
          selectedBrand={selectedBrand}
          setSelectedBrand={(brand) => {
            setSelectedBrand(brand);
            onBrandIdChange?.(brand?.id);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
