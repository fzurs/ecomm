"use client";

import { type Table as TanstackTable } from "@tanstack/react-table";
import { Check, ChevronDown, Columns } from "lucide-react";

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
                  <CommandItem
                    key={column.id}
                    value={column.id}
                    onSelect={() =>
                      column.toggleVisibility(!column.getIsVisible())
                    }
                    className="capitalize"
                  >
                    <span>{column.columnDef.meta?.label || column.id}</span>
                    <Check
                      className={cn(
                        "ml-auto",
                        column.getIsVisible() ? "opacity-100" : "opacity-0",
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
