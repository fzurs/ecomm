"use client";

import {
  DefaultError,
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { cn } from "@/lib/utils";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

function DebouncedCommandInput({
  value,
  onValueChange,
  debouncedMs = 300,
  ...props
}: React.ComponentProps<typeof CommandInput> & { debouncedMs?: number }) {
  const [inputValue, setInputValue] = React.useState("");

  const debouncedOnValueChange =
    onValueChange && useDebouncedCallback(onValueChange, debouncedMs);

  return (
    <CommandInput
      value={inputValue}
      onValueChange={(value) => {
        setInputValue(value);
        debouncedOnValueChange?.(value);
      }}
      {...props}
    />
  );
}

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

type InfiniteCommandContextProps = {
  queryOptions: UseInfiniteQueryOptions<any, any, any, any, any>;
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
};

const InfiniteCommandContext =
  React.createContext<InfiniteCommandContextProps | null>(null);

function useInfiniteCommand() {
  const context = React.useContext(InfiniteCommandContext);
  if (!context) {
    throw new Error(
      "useInfiniteQueryOptions must be used within a InfiniteCommand.",
    );
  }
  return context;
}

function useInfiniteCommandQuery<TData>() {
  const { queryOptions } = useInfiniteCommand();
  return useInfiniteQuery<TData, any, InfiniteData<TData>, any, any>(
    queryOptions,
  );
}

function InfiniteCommand<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>({
  queryOptions,
  ...props
}: React.ComponentProps<typeof Command> & {
  queryOptions:
    | ((
        searchValue: string,
      ) => UseInfiniteQueryOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryKey,
        TPageParam
      >)
    | UseInfiniteQueryOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryKey,
        TPageParam
      >;
}) {
  const [searchValue, setSearchValue] = React.useState("");

  const contextValue = React.useMemo(
    () => ({
      queryOptions: {
        ...(typeof queryOptions === "function"
          ? queryOptions(searchValue)
          : queryOptions),
      },
      searchValue,
      setSearchValue,
    }),
    [searchValue, setSearchValue, queryOptions],
  );

  return (
    <InfiniteCommandContext.Provider value={contextValue}>
      <Command shouldFilter={false} {...props} />
    </InfiniteCommandContext.Provider>
  );
}

function InfiniteCommandList({
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

  return <CommandList onScroll={onScroll} {...props} />;
}

function InfiniteCommandInput({
  ...props
}: React.ComponentProps<typeof DebouncedCommandInput>) {
  const { searchValue, setSearchValue } = useInfiniteCommand();

  return (
    <DebouncedCommandInput
      value={searchValue}
      onValueChange={setSearchValue}
      {...props}
    />
  );
}

function InfiniteCommandOptions<TData>({
  children,
  ...props
}: Omit<React.ComponentProps<typeof CommandGroup>, "children"> & {
  children?:
    | ((
        options: UseInfiniteQueryResult<InfiniteData<TData>>,
      ) => React.ReactNode)
    | React.ReactNode;
}) {
  const query = useInfiniteCommandQuery<TData>();
  return (
    <CommandGroup {...props}>
      {typeof children === "function" ? children(query) : children}
    </CommandGroup>
  );
}

export {
  DebouncedCommandInput,
  SelectableCommandItem,
  InfiniteCommand,
  InfiniteCommandList,
  InfiniteCommandInput,
  useInfiniteCommand,
  InfiniteCommandOptions,
};
