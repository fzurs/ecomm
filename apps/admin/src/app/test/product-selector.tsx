"use client";

import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useDebounce } from "use-debounce";

import * as React from "react";

import { productsApi } from "@/lib/apis";
import { cn } from "@/lib/utils";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getProductsInfiniteQueryOptions = (
  params?: Parameters<typeof productsApi.productsList>[0],
) =>
  infiniteQueryOptions({
    queryKey: ["products", params],
    queryFn: ({ pageParam }) =>
      productsApi
        .productsList({
          limit: 10,
          offset: pageParam * 10,
          ...params,
        })
        .then((res) => res.data),
    placeholderData: keepPreviousData,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length : undefined,
  });

export const getProductQueryOptions = (
  params: Parameters<typeof productsApi.productsRetrieve>[0],
) =>
  queryOptions({
    queryKey: ["products", "infinite", params],
    queryFn: () => productsApi.productsRetrieve(params).then((res) => res.data),
  });

export function ProductSelector() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = useQueryState(
    "product",
    parseAsString.withDefault(""),
  );
  const [search, setSearch] = React.useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const { data, hasNextPage, fetchNextPage, isLoading } = useInfiniteQuery({
    ...getProductsInfiniteQueryOptions({ search: debouncedSearch }),
    enabled: open,
  });

  const products = React.useMemo(
    () => data?.pages.flatMap((page) => page.results),
    [data],
  );

  const currentProduct = React.useMemo(
    () =>
      value ? products?.find((product) => product.id === value) : undefined,
    [value, products],
  );

  const { data: fetchedProduct } = useQuery({
    ...getProductQueryOptions({ id: value }),
    enabled: !!value && !currentProduct && !isLoading,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-[200px]"
        >
          {(value && (currentProduct?.name || fetchedProduct?.name)) ||
            "Assign a product..."}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search for a product..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList
            onScroll={(event) => {
              const target = event.currentTarget;
              if (
                hasNextPage &&
                target.scrollTop + target.clientHeight >= target.scrollHeight
              ) {
                fetchNextPage();
              }
            }}
          >
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {products?.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {product.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === product.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
