"use client";

import { Slot } from "@radix-ui/react-slot";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";
import { useDebounce } from "use-debounce";

import * as React from "react";

import { categoriesApi, productsApi } from "@/lib/apis";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Command,
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

export default function Test() {
  const examples: { title: string; component: React.FC }[] = [
    { title: "Basic", component: BasicExample },
    {
      title: "Basic seleted item",
      component: BasicExampleWithSelectedItem,
    },
    {
      title: "Basic seleted item and default item",
      component: BasicExampleWithSelectedItemAndDefaultValue,
    },
    { title: "Basic with query", component: BasicExampleWithReactQuery },
    {
      title: "Basic with query and selected item",
      component: BasicExampleWithReactQueryAndSelectedItem,
    },
    { title: "Full example", component: FullExample },
    { title: "Full example variant", component: FullExampleVariant },
    {
      title: "Full example variant and defaultValue",
      component: FullExampleVariantWithDefaultValue,
    },
  ];
  return (
    <div className="flex h-screen justify-center items-center p-4">
      <div className="grid grid-cols-8 gap-4">
        {examples.map((example, i) => (
          <div key={i} className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">
              {example.title}
            </span>
            <example.component />
          </div>
        ))}
      </div>
    </div>
  );
}

function BasicExample() {
  const [value, setValue] = React.useState("");

  const items = Array.from({ length: 10 }).map((_, i) => ({
    value: i.toString(),
    label: `option ${i.toString()}`,
  }));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button role="combobox" variant={"outline"} className="justify-between">
          {value
            ? items.find((item) => item.value === value)?.label
            : "Assing a value..."}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={setValue}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function BasicExampleWithSelectedItem() {
  const [item, setItem] = React.useState<(typeof items)[0] | null>(null);

  const items = Array.from({ length: 10 }).map((_, i) => ({
    value: i.toString(),
    label: `option ${i.toString()}`,
  }));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button role="combobox" variant={"outline"} className="justify-between">
          {item?.label || "Assing a value..."}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => setItem(item)}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function BasicExampleWithSelectedItemAndDefaultValue() {
  const items = Array.from({ length: 10 }).map((_, i) => ({
    value: i.toString(),
    label: `option ${i.toString()}`,
  }));
  const defaultItem = items[0];

  const [item, setItem] = React.useState<(typeof items)[0] | null>(defaultItem);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button role="combobox" variant={"outline"} className="justify-between">
          {item?.label || "Assing a value..."}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => setItem(item)}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function BasicExampleWithReactQuery() {
  const [value, setValue] = React.useState("");
  const [search, setSearch] = React.useState("");

  const { data } = useQuery({
    queryKey: ["products", { search }],
    queryFn: () => productsApi.productsList({ search }).then((res) => res.data),
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button role="combobox" variant={"outline"} className="justify-between">
          {value
            ? data?.results.find((item) => item.id === value)?.name
            : "Assing a value..."}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command shouldFilter={false}>
          <CommandInput value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandGroup>
              {data?.results.map((item) => (
                <CommandItem key={item.id} value={item.id} onSelect={setValue}>
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function BasicExampleWithReactQueryAndSelectedItem() {
  const [value, setValue] = React.useState<{ id: string; name: string } | null>(
    null,
  );

  const [search, setSearch] = React.useState("");

  const { data } = useQuery({
    queryKey: ["products", { search }],
    queryFn: () => productsApi.productsList({ search }).then((res) => res.data),
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button role="combobox" variant={"outline"} className="justify-between">
          {value?.name || "Assing a value..."}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command shouldFilter={false}>
          <CommandInput value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandGroup>
              {data?.results.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => setValue(item)}
                >
                  {item.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      item.id === value?.id ? "opacity-100" : "opacity-0",
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

export function FullExample() {
  const [open, setOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<{
    id: number;
    name: string;
  } | null>(null);

  const [search, setSearch] = React.useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const { data } = useInfiniteQuery({
    queryKey: ["categories", { search: debouncedSearch }],
    queryFn: ({ pageParam }) =>
      categoriesApi
        .categoriesList({
          limit: 10,
          offset: 10 * pageParam,
          search: debouncedSearch,
        })
        .then((res) => res.data),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: open,
  });

  const categories = data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button role="combobox" variant={"outline"} className="justify-between">
          {selectedItem?.name || "Assing a value..."}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command shouldFilter={false}>
          <CommandInput value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandGroup>
              {categories.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id.toString()}
                  onSelect={() => setSelectedItem(item)}
                >
                  {item.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      item.id === selectedItem?.id
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
  );
}

export function FullExampleVariant() {
  const [open, setOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<{
    id: number;
    name: string;
  } | null>(null);

  const [search, setSearch] = React.useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const { data } = useInfiniteQuery({
    queryKey: ["categories", { search: debouncedSearch }],
    queryFn: ({ pageParam }) =>
      categoriesApi
        .categoriesList({
          limit: 10,
          offset: 10 * pageParam,
          search: debouncedSearch,
        })
        .then((res) => res.data),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: open,
  });

  const categories = data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button role="combobox" variant={"outline"} className="justify-between">
          {selectedItem?.name || "Assing a value..."}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command shouldFilter={false}>
          <CommandInput value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandGroup>
              {categories.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id.toString()}
                  onSelect={() => setSelectedItem(item)}
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.id}
                    </span>
                    <span>{item.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function FullExampleVariantWithDefaultValue() {
  const [open, setOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<{
    id: number;
    name: string;
  } | null>({ id: 100, name: "TTT" });

  const [search, setSearch] = React.useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const { data } = useInfiniteQuery({
    queryKey: ["categories", { search: debouncedSearch }],
    queryFn: ({ pageParam }) =>
      categoriesApi
        .categoriesList({
          limit: 10,
          offset: 10 * pageParam,
          search: debouncedSearch,
        })
        .then((res) => res.data),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: open,
  });

  const categories = data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button role="combobox" variant={"outline"} className="justify-between">
          {selectedItem?.name || "Assing a value..."}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command shouldFilter={false}>
          <CommandInput value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandGroup>
              {categories.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id.toString()}
                  onSelect={() => setSelectedItem(item)}
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.id}
                    </span>
                    <span>{item.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function Selector({ children }: { children?: React.ReactNode }) {
  const [open, setOpen]= React.useState(false)

  return <Popover open={open} onOpenChange={setOpen}>{children}</Popover>;
}
