import { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { parseAsInteger, useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";

const PAGE_INDEX_KEY = "page";
const PAGE_SIZE_KEY = "perPage";

export function usePagination() {
  const [_pagination, _setPagination] = useQueryStates(
    {
      pageIndex: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
    },
    { urlKeys: { pageIndex: PAGE_INDEX_KEY, pageSize: PAGE_SIZE_KEY } }
  );

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: _pagination.pageIndex - 1,
      pageSize: _pagination.pageSize,
    }),
    [_pagination]
  );

  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updaterOrValue) => {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue;

      _setPagination({
        pageIndex: newPagination.pageIndex + 1,
        pageSize: newPagination.pageSize,
      });
    },
    [pagination, _setPagination]
  );

  return { pagination, onPaginationChange };
}

export function usePaginationValues(): Record<"limit" | "offset", number> {
  const {
    pagination: { pageIndex, pageSize },
  } = usePagination();
  return { offset: pageIndex * pageSize, limit: pageSize };
}
