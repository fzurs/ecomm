"use client";

import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { CommandInput } from "./ui/command";

export function DebouncedCommandInput({
  onValueChange,
  debounceMs = 300,
  ...props
}: React.ComponentProps<typeof CommandInput> & { debounceMs?: number }) {
  const [inputValue, setInputValue] = React.useState("");
  const debouncedOnValueChange =
    onValueChange && useDebouncedCallback(onValueChange, debounceMs);

  return (
    <CommandInput
      value={inputValue}
      onValueChange={(value) => {
        debouncedOnValueChange?.(value);
        setInputValue(value);
      }}
      {...props}
    />
  );
}
