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

export function BrandList({
  selectedBrand,
  setSelectedBrand,
}: {
  selectedBrand: Brand | null;
  setSelectedBrand: (brand: Brand | null) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [searchInternal, setSearchInternal] = React.useState("");
  const debouncedSetSearch = useDebouncedCallback(setSearch, 300);

  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery(
    getBrandsInfiniteQueryOptions({
      limit: 30,
      search,
    }),
  );

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search for a brand..."
        value={searchInternal}
        onValueChange={(value) => {
          setSearchInternal(value);
          debouncedSetSearch(value);
        }}
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
        <CommandEmpty>No brand found.</CommandEmpty>
        <CommandGroup>
          {data?.pages
            .flatMap((page) => page.results)
            ?.map((brand) => (
              <CommandItem
                key={brand.id}
                onSelect={() =>
                  setSelectedBrand(
                    brand.id !== selectedBrand?.id ? brand : null,
                  )
                }
              >
                {brand.name}
                <Check
                  className={cn(
                    "ml-auto",
                    selectedBrand?.id === brand.id
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

export function BrandSelect({
  brand,
  onBrandChange,
}: {
  brand?: Brand | null;
  onBrandChange?: (value: Brand | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedBrand, setSelectedBrand] = React.useState<Brand | null>(
    brand ?? null,
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
            onBrandChange?.(brand);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
