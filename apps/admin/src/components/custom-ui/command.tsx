"use client";

import { Check } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { cn } from "@/lib/utils";

import { CommandInput, CommandItem } from "@/components/ui/command";

function SelectableCommandItem({
  children,
  selected,
  ...props
}: React.ComponentProps<typeof CommandItem> & { selected?: boolean }) {
  return (
    <CommandItem {...props}>
      {children}
      <Check
        className={cn("ml-auto", selected ? "opacity-100" : "opacity-0")}
      />
    </CommandItem>
  );
}

function DebouncedCommandInput({
  value: valueProp,
  onValueChange: onValueChangeProp,
  wait = 300,
  ...props
}: React.ComponentProps<typeof CommandInput> & { wait?: number }) {
  const [value, setValue] = React.useState<string>(valueProp ?? "");

  const debouncedOnValueChange = useDebouncedCallback<(search: string) => void>(
    (search) => onValueChangeProp?.(search),
    wait,
  );

  const onValueChange = React.useCallback<(search: string) => void>(
    (search) => {
      setValue(search);
      if (onValueChangeProp) {
        debouncedOnValueChange(search);
      }
    },
    [onValueChangeProp, debouncedOnValueChange],
  );

  return (
    <CommandInput value={value} onValueChange={onValueChange} {...props} />
  );
}

export { SelectableCommandItem, DebouncedCommandInput };
