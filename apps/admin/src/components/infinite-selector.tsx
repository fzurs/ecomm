"use client";

import {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseQueryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import * as React from "react";

import {
  SelectorItem as InfiniteSelectorItem,
  SelectorTrigger as InfiniteSelectorTrigger,
  Selector,
  SelectorContent,
  SelectorEmpty,
  SelectorGroup,
  SelectorInput,
  SelectorList,
  SelectorValue,
  useSelector,
} from "@/components/selector";

type TItem = { id: string | number };
type Pagination<TData> = { results: TData[] };

type InfiniteSelectorContextProps<
  TData extends TItem = TItem,
  TQueryFnData extends Pagination<TData> = Pagination<TData>,
> = {
  queryOptions: UseInfiniteQueryOptions<
    TQueryFnData,
    any,
    InfiniteData<TQueryFnData>,
    any,
    any
  >;
  search: string;
  setSearch: (search: string) => void;
};

const InfiniteSelectorContext =
  React.createContext<InfiniteSelectorContextProps<any, any> | null>(null);

function useInfiniteSelector<TData extends TItem>() {
  const context = React.useContext(InfiniteSelectorContext);
  if (!context) {
    throw new Error(
      "useInfiniteSelector must be used within a InfiniteSelector.",
    );
  }

  return context as InfiniteSelectorContextProps<TData>;
}

function InfiniteSelector<
  TData extends TItem,
  TQueryFnData extends Pagination<TData>,
>({
  queryOptions: queryOptionsProp,
  ...props
}: React.ComponentProps<typeof Selector> & {
  queryOptions: (params: {
    search: string;
  }) => InfiniteSelectorContextProps<TData, TQueryFnData>["queryOptions"];
}) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const queryOptions = queryOptionsProp({ search: debouncedSearch });

  const contextValue = React.useMemo<
    InfiniteSelectorContextProps<TData, TQueryFnData>
  >(
    () => ({ queryOptions, search, setSearch }),
    [queryOptions, search, setSearch],
  );

  return (
    <InfiniteSelectorContext.Provider value={contextValue}>
      <Selector {...props} />
    </InfiniteSelectorContext.Provider>
  );
}

function InfiniteSelectorList({
  onScroll: onScrollProp,
  ...props
}: React.ComponentProps<typeof SelectorList>) {
  const { queryOptions } = useInfiniteSelector();
  const { hasNextPage, fetchNextPage } = useInfiniteQuery(queryOptions);

  return (
    <SelectorList
      onScroll={(event) => {
        onScrollProp?.(event);

        const target = event.currentTarget;
        if (
          hasNextPage &&
          target.scrollTop + target.clientHeight >= target.scrollHeight
        ) {
          fetchNextPage();
        }
      }}
      {...props}
    />
  );
}

function InfiniteSelectorInput({
  ...props
}: React.ComponentProps<typeof SelectorInput>) {
  const { search, setSearch } = useInfiniteSelector();

  return <SelectorInput value={search} onValueChange={setSearch} {...props} />;
}

function InfiniteSelectorContent({
  shouldFilter = false,
  ...props
}: React.ComponentProps<typeof SelectorContent>) {
  return <SelectorContent shouldFilter={shouldFilter} {...props} />;
}

function InfiniteSelectorGroup<TData extends TItem>({
  render,
  ...props
}: Omit<React.ComponentProps<typeof SelectorGroup>, "children"> & {
  render: (results: TData[]) => React.ReactNode | React.JSX.Element[];
}) {
  const { queryOptions } = useInfiniteSelector<TData>();
  const { data } = useInfiniteQuery(queryOptions);

  const results = React.useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data],
  );

  return <SelectorGroup {...props}>{render(results)}</SelectorGroup>;
}

function InfiniteSelectorValue<TData extends TItem>({
  render,
  resolveQuery,
  ...props
}: Omit<React.ComponentProps<typeof SelectorValue>, "render"> & {
  resolveQuery: (ctx: {
    value: string;
  }) => UseQueryOptions<any, any, TData, any>;
  render: (item?: TData) => React.ReactNode;
}) {
  const { queryOptions } = useInfiniteSelector<TData>();
  const { value, valueNode, open } = useSelector();

  const { data, isLoading } = useInfiniteQuery({
    ...queryOptions,
    enabled: open,
  });
  const results = React.useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data],
  );

  const currentItem = results.find((item) => item.id.toString() === value);
  const { data: fetchedItem } = useQuery<TData>({
    ...resolveQuery({ value: value as string }),
    enabled: !!value && !currentItem && !valueNode && !isLoading,
  });

  return (
    <SelectorValue
      render={() => render(currentItem || fetchedItem)}
      {...props}
    />
  );
}

function InfiniteSelectorNoFound({
  ...props
}: React.ComponentProps<typeof SelectorEmpty>) {
  const { queryOptions } = useInfiniteSelector();
  const { isPending } = useInfiniteQuery(queryOptions);
  if (isPending) return null;

  return <SelectorEmpty {...props} />;
}

function InfiniteSelectorLoader({
  ...props
}: React.ComponentProps<typeof SelectorEmpty>) {
  const { queryOptions } = useInfiniteSelector();
  const { isPending } = useInfiniteQuery(queryOptions);
  if (!isPending) return null;

  return <SelectorEmpty className="text-muted-foreground" {...props} />;
}

export {
  InfiniteSelector,
  InfiniteSelectorTrigger,
  InfiniteSelectorValue,
  InfiniteSelectorContent,
  InfiniteSelectorItem,
  InfiniteSelectorNoFound,
  SelectorEmpty as InfiniteSelectorEmpty,
  InfiniteSelectorGroup,
  InfiniteSelectorList,
  InfiniteSelectorInput,
  InfiniteSelectorLoader,
  useInfiniteSelector,
};
