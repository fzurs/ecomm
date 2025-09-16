import {
  RowData,
  SortingState,
  TableOptions,
  Updater,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";

const paginationParsers = {
  pageIndex: parseAsIndex.withDefault(0),
  pageSize: parseAsInteger.withDefault(10),
};

const paginationUrlKeys = {
  pageIndex: "page",
  pageSize: "perPage",
};

export function usePagination() {
  return useQueryStates(paginationParsers, {
    urlKeys: paginationUrlKeys,
  });
}

export function useOrdering() {
  return useQueryState("ordering", parseAsString.withDefault(""));
}

function parseSortParam(param: string | null) {
  if (!param) return [];
  return [
    param.startsWith("-")
      ? { id: param.slice(1), desc: true }
      : { id: param, desc: false },
  ];
}

function serializeSorting(
  sorting: { id: string; desc?: boolean }[] | undefined,
) {
  if (!sorting) return "";
  if (sorting.length === 0) return null;
  const first = sorting[0];
  return first.desc ? `-${first.id}` : first.id;
}

function useSingleSorting() {
  const [ordering, setOrdering] = useOrdering();

  const sorting = parseSortParam(ordering);

  const onSortingChange = (updater: Updater<SortingState>) => {
    const newSorting =
      typeof updater === "function" ? updater(sorting) : updater;

    setOrdering(serializeSorting(newSorting));
  };

  return { sorting, onSortingChange };
}

export function useDataTable<TData extends RowData>({
  data = { results: [], count: 0 },
  ...options
}: Omit<TableOptions<TData>, "getCoreRowModel" | "data"> & {
  data?: { results: TData[]; count: number };
}) {
  const [pagination, setPagination] = usePagination();
  const { sorting, onSortingChange } = useSingleSorting();

  return useReactTable({
    ...options,
    data: data.results,
    pageCount: Math.ceil(data.count / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) =>
      (row as { id: unknown }).id
        ? String((row as { id: unknown }).id)
        : String(index),
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });
}
