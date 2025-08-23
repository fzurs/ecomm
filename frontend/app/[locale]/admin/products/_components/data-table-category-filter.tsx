"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ListFilter } from "lucide-react";
import { Column, Table } from "@tanstack/react-table";
import { useCategories } from "../_hooks/use-categories";
import { parseAsString, useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";

const columnId = "category";

export function DataTableCategoryFilter<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  const column = table.getColumn(columnId) as Column<TData>;

  const { data: categories } = useCategories();

  const [open, setOpen] = React.useState(false);

  const [queryValue, setQueryValue] = useQueryState(
    columnId as string,
    parseAsString
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

  const debouncedSetValue = useDebouncedCallback((value: string | null) => {
    setQueryValue(value || null);
    column.setFilterValue(value || undefined);
  }, 300);

  const currentValue = categories?.find(
    (category) => category.slug === inputValue
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="lg:justify-between lg:w-[200px] size-9"
        >
          <span className="sr-only lg:not-sr-only">
            {currentValue ? currentValue.name : "Filter by category"}
          </span>
          <ListFilter />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories?.map((category) => (
                <CommandItem
                  key={category.slug}
                  value={category.name}
                  onSelect={() => {
                    const value =
                      category.slug === inputValue ? null : category.slug;
                    setInputValue(value);
                    debouncedSetValue(value);
                    setOpen(false);
                  }}
                >
                  {category.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      inputValue === category.slug ? "opacity-100" : "opacity-0"
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
