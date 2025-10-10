"use client";

import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { Input } from "@/components/ui/input";

function DebouncedInput({
  value: valueProp,
  onValueChange: onValueChangeProp,
  defaultValue,
  wait = 300,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "onChange"> & {
  wait?: number;
  onValueChange?: (value: string) => void;
}) {
  const [value, setValue] = React.useState<string>(String(valueProp) ?? "");

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
    <Input
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      {...props}
    />
  );
}

export { DebouncedInput };
