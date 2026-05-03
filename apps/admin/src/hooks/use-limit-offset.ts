import { parseAsIndex, parseAsInteger, useQueryStates } from "nuqs";

export function useLimitOffset() {
  const { page, perPage } = useQueryStates({
    page: parseAsIndex.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
  })[0];
  return { limit: perPage, offset: (page - 1) * perPage };
}
