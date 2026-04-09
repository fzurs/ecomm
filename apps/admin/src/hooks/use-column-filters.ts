import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
} from "@tanstack/react-table";
import {
  SingleParser,
  useQueryStates,
  UseQueryStatesKeysMap,
  UseQueryStatesReturn,
  Values,
} from "nuqs";
import { useCallback, useMemo, useState } from "react";

type ColumnFilterParsers<TData, C extends readonly ColumnDef<TData>[]> = {
  [K in C[number] as K extends { id: string }
    ? K["id"]
    : never]: K["meta"] extends {
    filterParser: infer P extends SingleParser<any>;
  }
    ? P
    : never;
};

function createColumnFilterParsers<
  TData,
  const C extends readonly ColumnDef<TData>[],
>(columns: C): ColumnFilterParsers<TData, C> {
  let columnFilterParsers: UseQueryStatesKeysMap = {};
  columns.forEach((column) => {
    if (column.id && column.enableColumnFilter && column.meta?.filterParser) {
      columnFilterParsers[column.id] = column.meta.filterParser;
    }
  });
  return columnFilterParsers as ColumnFilterParsers<TData, C>;
}

function useColumnFiltersSearchParams<
  TData,
  const C extends readonly ColumnDef<TData>[],
>(columns: C): UseQueryStatesReturn<ColumnFilterParsers<TData, C>> {
  return useQueryStates(createColumnFilterParsers(columns));
}

export function useColumnFilterValues<
  TData,
  const C extends readonly ColumnDef<TData>[],
>(columns: C | ColumnDef<TData>[]): Values<ColumnFilterParsers<TData, C>> {
  return useColumnFiltersSearchParams<TData, C>(columns as C)[0];
}

export function useColumnFilters<TData>(columns: ColumnDef<TData>[]) {
  // Column filter values from searchParams
  const columnFilterParsers = createColumnFilterParsers<
    TData,
    ColumnDef<TData>[]
  >(columns);
  const [columnFiltersValues, setColumnFiltersValues] =
    useColumnFiltersSearchParams(columns as ColumnDef<unknown>[]);
  const initialColumnFilters = useMemo<ColumnFiltersState>(() => {
    return Object.entries(columnFiltersValues).reduce<ColumnFiltersState>(
      (columnFilters, [id, value]) => {
        if (value !== null) {
          columnFilters.push({ id, value });
        }
        return columnFilters;
      },
      [],
    );
  }, [columnFiltersValues]);
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters);
  const onColumnFiltersChange = useCallback<OnChangeFn<ColumnFiltersState>>(
    (updaterOrValue) => {
      setColumnFilters((previousColumnFilters) => {
        const newColumnFilters =
          typeof updaterOrValue === "function"
            ? updaterOrValue(previousColumnFilters)
            : updaterOrValue;
        // Updating columnFilters from searchParams
        const columnFilterUpdates = newColumnFilters.reduce<
          Record<string, any>
        >((updatedColumnFilters, columnFilter) => {
          (updatedColumnFilters as any)[columnFilter.id] = columnFilter.value;
          return updatedColumnFilters;
        }, {});
        // Clear ghost filter
        for (const previousColumnFilter of previousColumnFilters) {
          if (
            !newColumnFilters.some(
              (columnFilter) => columnFilter.id === previousColumnFilter.id,
            )
          ) {
            columnFilterUpdates[previousColumnFilter.id] = null;
          }
        }
        setColumnFiltersValues(columnFilterUpdates);
        return newColumnFilters;
      });
    },
    [setColumnFilters, setColumnFiltersValues],
  );

  return { columnFilters, onColumnFiltersChange };
}
