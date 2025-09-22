import {
  RowData,
  TableOptions,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  createParser,
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";

import * as React from "react";

const paginationParsers = {
  pageIndex: parseAsIndex.withDefault(0),
  pageSize: parseAsInteger.withDefault(10),
};
const paginationUrlKeys = {
  pageIndex: "page",
  pageSize: "perPage",
};

export function usePaginationSearchParams() {
  return useQueryStates(paginationParsers, {
    urlKeys: paginationUrlKeys,
  });
}

export const parseAsSort = createParser({
  parse(queryValue) {
    const desc = queryValue.startsWith("-");
    const id = desc ? queryValue.slice(1) : queryValue;
    if (!id) return [];
    return [{ id, desc }];
  },
  serialize(value) {
    if (!value.length) return "";
    const sort = value[0];
    return `${sort.desc ? "-" : ""}${sort.id}`;
  },
  eq(a, b) {
    return (
      a.length === b.length && a.every((element, index) => element === b[index])
    );
  },
});

export function useSortingSearchParams() {
  return useQueryState("sort", parseAsSort.withDefault([]));
}

export function useGlobalFilterSearchParams() {
  return useQueryState("q", parseAsString.withDefault(""));
}

export function useDataTable<TData extends RowData>({
  data = { results: [], count: 0 },
  ...props
}: Omit<TableOptions<TData>, "getCoreRowModel" | "data"> & {
  data?: { results: TData[]; count: number };
}) {
  const [pagination, setPagination] = usePaginationSearchParams();
  const [sorting, setSorting] = useSortingSearchParams();
  const [globalFilter, setGlobalFilter] = useGlobalFilterSearchParams();

  const onGlobalFilterChange = React.useCallback((value: string) => {
    setPagination({ pageIndex: paginationParsers.pageIndex.defaultValue });
    setGlobalFilter(value);
  }, []);

  return useReactTable({
    data: data.results,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination, sorting, globalFilter },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(data.count / pagination.pageSize),
    ...props,
  });
}
