"use client";

import { Search } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Input } from "./ui/input";

export function useSearch() {
  return useQueryState("search", parseAsString.withDefault(""));
}

export function SearchInput({
  type = "search",
  placeholder = "Search...",
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [search, setSearch] = useSearch();

  const debouncedSetSearch = useDebouncedCallback(setSearch, 300);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        type={type}
        defaultValue={search}
        onChange={(e) => {
          debouncedSetSearch(e.target.value);
        }}
        placeholder={placeholder}
        className={cn("pl-10", className)}
        {...props}
      />
    </div>
  );
}
