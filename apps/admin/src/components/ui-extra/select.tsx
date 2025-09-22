"use client";

import * as React from "react";

import { SelectableCommandItem } from "@/components/ui-extra/command";

type SelectContextValue<T> = {
  value: T | null;
  onValueChange: (value: T | null) => void;
  eq: (a: T | null, b: T) => boolean;
};

const SelectContext = React.createContext<SelectContextValue<unknown> | null>(
  null,
);

function useSelect<T>() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("useSelect must be used within a Select.");
  }
  return context as SelectContextValue<T>;
}

function Select<TData>({
  value,
  onValueChange,
  eq = () => false,
  children,
}: Partial<SelectContextValue<TData>> & {
  children?: React.ReactNode;
}) {
  const [internalValue, setInternalValue] = React.useState<TData | null>(null);

  const isControlled = value !== undefined;

  const handleOnValueChange = React.useCallback(
    (value: TData | null) => {
      if (!isControlled) {
        setInternalValue(value);
      }
      onValueChange?.(value);
    },
    [onValueChange],
  );

  const contextValue = React.useMemo(
    () => ({
      value: value !== undefined ? value : internalValue,
      onValueChange: handleOnValueChange,
      eq,
    }),
    [value, internalValue, handleOnValueChange, eq],
  );

  return (
    <SelectContext.Provider value={contextValue as SelectContextValue<unknown>}>
      {children}
    </SelectContext.Provider>
  );
}

function SelectItemComp<TData>({
  value,
  children,
  ...props
}: Omit<React.ComponentProps<typeof SelectableCommandItem>, "value"> & {
  value: TData;
}) {
  const { value: currentValue, onValueChange, eq } = useSelect<TData>();

  const selected = React.useMemo(
    () => eq(currentValue, value),
    [currentValue, value, eq],
  );

  const handleSelect = React.useCallback(() => {
    onValueChange(selected ? null : value);
  }, [onValueChange, selected, value]);

  return (
    <SelectableCommandItem
      selected={selected}
      onSelect={handleSelect}
      {...props}
    >
      {children}
    </SelectableCommandItem>
  );
}
const SelectItem = React.memo(SelectItemComp) as typeof SelectItemComp;

function SelectValue<TData>({
  children,
  ...props
}: {
  children?: ((value: TData | null) => React.ReactNode) | React.ReactNode;
} & Omit<React.ComponentProps<"span">, "children">) {
  const { value } = useSelect<TData>();

  return (
    <span {...props}>
      {typeof children === "function" ? children(value) : children}
    </span>
  );
}

export { Select, SelectItem, SelectValue, useSelect };
