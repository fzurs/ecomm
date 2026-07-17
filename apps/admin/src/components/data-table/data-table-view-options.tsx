"use client"

import type { Table } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"

import { IconChevronDown, IconLayoutColumns } from "@tabler/icons-react"
import { snakeCaseToTitle } from "@/lib/utils"
import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import { Check } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export function DataTableViewOptions<TData>({
  table,
}: {
  table: Table<TData>
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <IconLayoutColumns />
          <span className="hidden lg:inline">Customize Columns</span>
          <span className="lg:hidden">Columns</span>
          <IconChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-0">
        <Command>
          <CommandInput placeholder="Filter..." />
          <CommandEmpty></CommandEmpty>
          <CommandList>
            <CommandGroup>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <CommandItem
                      key={column.id}
                      value={column.id}
                      onSelect={() => column.toggleVisibility()}
                    >
                      {snakeCaseToTitle(column.id)}
                      <Check
                        className={cn(
                          "ml-auto",
                          column.getIsVisible() ? "visible" : "invisible"
                        )}
                      />
                    </CommandItem>
                  )
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
