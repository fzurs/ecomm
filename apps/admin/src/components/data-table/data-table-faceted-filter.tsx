"use client";

import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Column } from "@tanstack/react-table";
import { Option } from "@/lib/types";
import { useCallback, useState } from "react";

export function DataTableFacetedFilter<TData>({
  column,
  options,
}: {
  column: Column<TData>;
  options: Option[];
}) {
  const [open, setOpen] = useState(false);
  const columnFilterValue = column.getFilterValue() as string;

  const onItemSelect = useCallback(
    (option: Option) => {
      column.setFilterValue(
        columnFilterValue === option.value ? undefined : option.value
      );
      setOpen(false);
    },
    [column, columnFilterValue]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button role="combobox">Filter</Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => onItemSelect(option)}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
