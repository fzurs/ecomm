"use client";

import {
  InfiniteData,
  UseInfiniteQueryOptions,
  useInfiniteQuery,
} from "@tanstack/react-query";

import * as React from "react";

import { Command, CommandGroup, CommandList } from "@/components/ui/command";

import { DebouncedCommandInput } from "./command";

type InfiniteCommandContextProps<TData> = {
  queryOptions: UseInfiniteQueryOptions<
    TData,
    any,
    InfiniteData<TData>,
    any,
    any
  >;
  search: string;
  setSearch: (value: string) => void;
};

const InfiniteCommandContext =
  React.createContext<InfiniteCommandContextProps<any> | null>(null);

function useInfiniteCommand<TData>() {
  const context = React.useContext(InfiniteCommandContext);
  if (!context) {
    throw new Error(
      "useInfiniteCommand must be used within a InfiniteCommand.",
    );
  }
  return context as InfiniteCommandContextProps<TData>;
}

function useInfiniteCommandQuery<TData>() {
  const { queryOptions } = useInfiniteCommand<TData>();
  return useInfiniteQuery(queryOptions);
}

function InfiniteCommand<TData>({
  queryOptions: queryOptionsProp,
  ...props
}: React.ComponentProps<typeof Command> & {
  queryOptions:
    | ((params: {
        search: string;
      }) => InfiniteCommandContextProps<TData>["queryOptions"])
    | InfiniteCommandContextProps<TData>["queryOptions"];
}) {
  const [search, setSearch] = React.useState("");

  const queryOptions = React.useMemo(() => {
    if (typeof queryOptionsProp === "function") {
      return queryOptionsProp({ search });
    } else {
      return queryOptionsProp;
    }
  }, [queryOptionsProp, search]);

  const contextValue = React.useMemo<InfiniteCommandContextProps<TData>>(
    () => ({ queryOptions, search, setSearch }),
    [queryOptions, search, setSearch],
  );

  return (
    <InfiniteCommandContext.Provider value={contextValue}>
      <Command shouldFilter={false} {...props} />
    </InfiniteCommandContext.Provider>
  );
}

function InfiniteCommandList({
  onScroll: onScrollProp,
  ...props
}: React.ComponentProps<typeof CommandList>) {
  const { hasNextPage, fetchNextPage } = useInfiniteCommandQuery();

  const onScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const target = e.currentTarget;
      if (
        hasNextPage &&
        target.scrollTop + target.clientHeight >= target.scrollHeight
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, fetchNextPage],
  );

  return (
    <CommandList
      onScroll={(event) => {
        onScrollProp?.(event);
        onScroll(event);
      }}
      {...props}
    />
  );
}

function InfiniteCommandInput({
  ...props
}: React.ComponentProps<typeof DebouncedCommandInput>) {
  const { search, setSearch } = useInfiniteCommand();

  return (
    <DebouncedCommandInput
      value={search}
      onValueChange={setSearch}
      {...props}
    />
  );
}

function InfiniteCommandGroup<TData>({
  render,
  ...props
}: Omit<React.ComponentProps<typeof CommandGroup>, "children"> & {
  render: (data: InfiniteData<TData>) => React.ReactNode;
}) {
  const { data } = useInfiniteCommandQuery<TData>();

  if (!data) return null;

  return <CommandGroup {...props}>{render(data)}</CommandGroup>;
}

export {
  InfiniteCommand,
  InfiniteCommandList,
  InfiniteCommandInput,
  InfiniteCommandGroup,
  useInfiniteCommand,
};
