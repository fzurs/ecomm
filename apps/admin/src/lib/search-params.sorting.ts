import { SortingState } from "@tanstack/react-table";
import { createParser, useQueryState } from "nuqs";

export const parseAsSort = createParser({
  parse(value): SortingState {
    const [field, sort] = value.split(".");
    return [{ id: field, desc: sort === "desc" ? true : false }];
  },
  serialize(value) {
    const { id, desc } = value[0];
    return `${id}.${desc ? "desc" : "asc"}`;
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

export const parseAsOrdering = createParser({
  ...parseAsSort,
  serialize(value) {
    if (!value.length) return "";
    const sort = value[0];
    return `${sort.desc ? "-" : ""}${sort.id}`;
  },
});

export function useOrderingSearchParams() {
  const [sorting] = useSortingSearchParams();
  const ordering = parseAsOrdering.serialize(sorting) || undefined;
  return { ordering };
}
