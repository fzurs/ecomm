"use client";

import * as React from "react";

import { Selector, SelectorItem, SelectorValue } from "./selector";

type TSelectorContextProps<TItem> = {
  item: TItem | null;
  setItem: (item: TItem | null) => void;
  renderItem: (item: TItem) => React.ReactNode;
};

const TSelectorContext = React.createContext<TSelectorContextProps<any> | null>(
  null,
);

function useTSelector<TItem>() {
  const context = React.useContext(TSelectorContext);
  if (!context) {
    throw new Error("useTSelector must be used within a TSelector.");
  }

  return context as TSelectorContextProps<TItem>;
}

function TSelector<TItem extends { id: string | number }>({
  original,
  renderItem = (item) => item.id,
  onValueChange,
  children,
}: {
  original?: TItem;
  renderItem?: (item: TItem) => React.ReactNode;
  onValueChange?: (value: TItem["id"] | null) => void;
  children?: React.ReactNode;
}) {
  const [search, setSearch] = React.useState("");
  const [item, _setItem] = React.useState<TItem | null>(original ?? null);
  const value = item ? item.id.toString() : "";
  const setItem = React.useCallback(
    (item: TItem | null) => {
      _setItem(item);
      onValueChange?.(item ? item.id : null);
    },
    [onValueChange],
  );

  const contextValue = React.useMemo<TSelectorContextProps<TItem>>(
    () => ({
      search,
      setSearch,
      item,
      setItem,
      renderItem,
    }),
    [search, setSearch, item, setItem, renderItem],
  );

  return (
    <TSelectorContext.Provider value={contextValue}>
      <Selector value={value}>{children}</Selector>
    </TSelectorContext.Provider>
  );
}

function TSelectorItem<TItem extends { id: string | number }>({
  item: itemProp,
  ...props
}: React.ComponentProps<typeof SelectorItem> & { item: TItem }) {
  const { item, setItem } = useTSelector<TItem>();

  const checked = item ? item.id === itemProp.id : false;

  return (
    <SelectorItem
      checked={checked}
      value={itemProp.id.toString()}
      onSelect={() => {
        setItem(checked ? null : itemProp);
      }}
      {...props}
    />
  );
}

function TSelectorValue<TItem>({
  placeholder,
  ...props
}: React.ComponentProps<"span"> & {
  placeholder?: React.ReactNode;
  render?: (item: TItem) => React.ReactNode;
}) {
  const { item, renderItem } = useTSelector<TItem>();

  return (
    <SelectorValue {...props}>
      {item ? renderItem(item) : placeholder}
    </SelectorValue>
  );
}

export { TSelector, TSelectorItem, TSelectorValue };
