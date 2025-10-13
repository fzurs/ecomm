import { ColumnFiltersState } from "@tanstack/react-table";
import { parseAsArrayOf, parseAsJson, useQueryState } from "nuqs";
import z from "zod";

export function useColumnFiltersSearchParams() {
  return useQueryState<ColumnFiltersState>(
    "filters",
    parseAsArrayOf(
      parseAsJson(z.object({ id: z.string(), value: z.unknown() })),
    ).withDefault([]),
  );
}
