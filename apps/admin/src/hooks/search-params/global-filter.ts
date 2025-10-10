import { parseAsString, useQueryState } from "nuqs";

export function useGlobalFilterSearchParams() {
  return useQueryState("search", parseAsString.withDefault(""));
}
