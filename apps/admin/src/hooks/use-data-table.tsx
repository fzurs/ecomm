import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowData,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";

import { parseAsIndex, parseAsInteger, useQueryStates } from "nuqs";

const paginationParsers = {
  pageIndex: parseAsIndex.withDefault(0),
  pageSize: parseAsInteger.withDefault(10),
};

const paginationUrlKeys = {
  pageIndex: "page",
  pageSize: "perPage",
};

export function useDataTable<TData extends RowData>(
  props: Omit<TableOptions<TData>, "getCoreRowModel">
) {
  const [pagination, setPagination] = useQueryStates(paginationParsers, {
    urlKeys: paginationUrlKeys,
  });

  return useReactTable({
    ...props,
    state: {
      ...props.state,
      pagination,
    },
    enableRowSelection: true,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
}
