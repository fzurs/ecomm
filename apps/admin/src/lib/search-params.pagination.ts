import { parseAsIndex, parseAsInteger, useQueryStates } from "nuqs";

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

export function useLimitOffsetSearchParams() {
  const [pagination] = usePaginationSearchParams();
  const limit = pagination.pageSize;
  const offset = pagination.pageIndex * pagination.pageSize;
  return { limit, offset };
}
