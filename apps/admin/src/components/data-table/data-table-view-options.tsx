"use client";

import { type Table as TanstackTable } from "@tanstack/react-table";
import { ChevronDown, Columns } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { SelectableCommandItem } from "@/components/custom-ui/command";

export function DataTableViewOptions<TData>({
  table,
}: {
  table: TanstackTable<TData>;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          <div className="flex gap-2 items-center">
            <Columns />
            Columns
          </div>
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="p-0">
        <Command>
          <CommandInput placeholder="Search columns..." />
          <CommandList>
            <CommandEmpty>No columns found.</CommandEmpty>
            <CommandGroup>
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide(),
                )
                .map((column) => (
                  <SelectableCommandItem
                    key={column.id}
                    value={column.id}
                    selected={column.getIsVisible()}
                    onSelect={() =>
                      column.toggleVisibility(!column.getIsVisible())
                    }
                    className="capitalize"
                  >
                    {column.columnDef.meta?.label || column.id}
                  </SelectableCommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
