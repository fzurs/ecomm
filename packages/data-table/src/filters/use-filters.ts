import { ColumnDef } from "@tanstack/react-table"
import { useQueryStates, UseQueryStatesKeysMap } from "nuqs"
import { buildFilterParsers, FilterParsers } from "./build-filter-parsers"
import { normalizeFilters } from "./normalize-filters"
import { useMemo } from "react"
import { Merge } from "../types.utils"

export function useFilters<
  C extends ColumnDef<any>[],
  T extends UseQueryStatesKeysMap,
>(columns: C, filterParsers: T) {
  const [values] = useQueryStates({
    ...buildFilterParsers(columns),
    ...filterParsers,
  } as Merge<FilterParsers<C>, T>)
  return useMemo(() => normalizeFilters(values), [values])
}
