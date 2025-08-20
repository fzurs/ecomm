"use client";

import * as React from "react";
import { Input } from "../ui/input";
import { Column, Table as TanstackTable } from "@tanstack/react-table";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/lib/utils";
import { parseAsString, useQueryState } from "nuqs";

const DEBOUNCE_MS = 300;

export function DataTableSearchInput<TData>({
  table,
  columnId,
  className,
  placeholder = "Filtrar...",
  debounceMs = DEBOUNCE_MS,
  queryKey,
  ...props
}: {
  table: TanstackTable<TData>;
  columnId: string;
  debounceMs?: number;
  queryKey?: string;
} & Omit<React.ComponentProps<"input">, "value" | "onChange">) {
  const column = table.getColumn(columnId) as Column<TData>;

  const searchKey = queryKey ?? columnId;
  const [queryValue, setQueryValue] = useQueryState(
    searchKey,
    parseAsString.withDefault("")
  );

  const [inputValue, setInputValue] = React.useState(queryValue);

  React.useEffect(() => {
    setInputValue(queryValue);
  }, [queryValue]);

  React.useEffect(() => {
    const currentFilterValue = (column.getFilterValue() as string) ?? "";
    if (queryValue !== currentFilterValue) {
      column.setFilterValue(queryValue);
    }
  }, [column, queryValue]);

  const debouncedSetValue = useDebouncedCallback((value: string) => {
    setQueryValue(value || null);
    column.setFilterValue(value || undefined);
  }, debounceMs);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetValue(value);
  };

  return (
    <Input
      type="search"
      className={cn("max-w-[300px]", className)}
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      {...props}
    />
  );
}
