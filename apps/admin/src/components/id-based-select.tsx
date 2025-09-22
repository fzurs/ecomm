"use client";

import * as React from "react";

import { CommandItem } from "./ui/command";

type IdBasedSelectContextProps<TData> = {
  entity: TData | null;
  setEntity: (entity: TData) => void;
};

const IdBasedSelectContext =
  React.createContext<IdBasedSelectContextProps<any> | null>(null);

function useIdBasedSelect<TData>() {
  const context = React.useContext(IdBasedSelectContext);
  if (!context) {
    throw new Error("useIdBasedSelect must be used within a IdBasedSelect");
  }
  return context as IdBasedSelectContextProps<TData>;
}

function IdBasedSelect<TData, TKey extends keyof TData>({
  value: valueProp,
  onValueChange: setValueProp,
  idKey = "id" as TKey,
  children,
}: {
  value?: TData[TKey] | null;
  onValueChange?: (value: TData[TKey] | null) => void;
  idKey?: TKey;
  children?: React.ReactNode;
}) {
  const [entity, _setEntity] = React.useState<TData | null>(null);

  const setEntity = React.useCallback(
    (value: TData) => {
      setEntity(value);
      if (setValueProp) {
        setValueProp(value[idKey]);
      }
    },
    [setValueProp],
  );

  const contextValue = React.useMemo<IdBasedSelectContextProps<TData>>(
    () => ({ entity, setEntity }),
    [entity, setEntity],
  );

  return (
    <IdBasedSelectContext.Provider value={contextValue}>
      {children}
    </IdBasedSelectContext.Provider>
  );
}

function SelectCommandItem<TData>({
  value,
  onClick,
  ...props
}: React.ComponentProps<typeof CommandItem> & { value: TData }) {
  const { setEntity } = useIdBasedSelect<TData>();

  return (
    <CommandItem
      onClick={(event) => {
        onClick?.(event);
        setEntity(value);
      }}
      {...props}
    />
  );
}

export { IdBasedSelect, SelectCommandItem, useIdBasedSelect };
