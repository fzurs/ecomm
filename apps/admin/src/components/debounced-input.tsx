"use client";

import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { Input } from "@/components/ui/input";

import { CommandInput } from "./ui/command";

export function DebouncedInput({
  value,
  onChange,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [inputValue, setInputValue] = React.useState(value);
  const debouncedOnChange = onChange && useDebouncedCallback(onChange, 300);

  return (
    <Input
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        debouncedOnChange?.(e);
      }}
      {...props}
    />
  );
}

export function DebouncedCommandInput({
  value,
  onValueChange,
  ...props
}: React.ComponentProps<typeof CommandInput>) {
  const [inputValue, setInputValue] = React.useState(value);
  const debouncedOnChange =
    onValueChange && useDebouncedCallback(onValueChange, 300);

  return (
    <CommandInput
      value={inputValue}
      onValueChange={debouncedOnChange}
      {...props}
    />
  );
}
