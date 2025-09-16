"use client";

import { Check, ChevronDown, CircleDashed } from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";

import * as React from "react";

import { ProductStatusEnum } from "@workspace/api-client";

import { cn } from "@/lib/utils";

import { statusOptions } from "./status-select";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function StatusList({
  selectedStatus,
  setSelectedStatus,
}: {
  selectedStatus: ProductStatusEnum | null;
  setSelectedStatus: (status: ProductStatusEnum) => void;
}) {
  return (
    <Command>
      <CommandInput placeholder="Search for a status..." />
      <CommandList>
        <CommandEmpty>No status found.</CommandEmpty>
        <CommandGroup>
          {statusOptions.map((option) => (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={() => {
                setSelectedStatus(option.value);
              }}
            >
              {option.icon}
              {option.label}
              <Check
                className={cn(
                  "ml-auto",
                  selectedStatus === option.value ? "opacity-100" : "opacity-0",
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function useStatusSearchParams() {
  return useQueryState(
    "status",
    parseAsStringEnum(Object.values(ProductStatusEnum)),
  );
}

export function StatusFilter() {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = useStatusSearchParams();

  const currentStatusOption = statusOptions.find(
    ({ value }) => value === status,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {currentStatusOption ? (
            <>
              {currentStatusOption.icon}
              {currentStatusOption.label}
            </>
          ) : (
            <>
              <CircleDashed />
              Status
            </>
          )}
          <ChevronDown className="opacity-50 ms-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <StatusList
          selectedStatus={status}
          setSelectedStatus={(value) => {
            setStatus(value !== status ? value : null);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
