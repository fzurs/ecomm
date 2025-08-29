"use client";

import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Column } from "@tanstack/react-table";
import { Option } from "@/lib/types";
import { useCallback, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataTableFacetedFilter<TData>({
  column,
  options,
  title,
}: {
  column: Column<TData>;
  options: Option[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const columnFilterValue = column.getFilterValue() as string;

  const onItemSelect = useCallback(
    (option: Option) => {
      column.setFilterValue(
        columnFilterValue === option.value ? undefined : option.value
      );
    },
    [column, columnFilterValue]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {options.find((option) => option.value === columnFilterValue)
            ?.label ?? "Filter by category"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 max-w-[200px]" align="start">
        <Command>
          <CommandInput placeholder={`Search ${title}`} className="h-9" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => onItemSelect(option)}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      columnFilterValue === option.value
                        ? "opacity-100"
                        : "opacity-0"
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
