import {
  functionalUpdate,
  OnChangeFn,
  PaginationState,
} from "@tanstack/react-table"
import { parseAsIndex, parseAsInteger, useQueryStates } from "nuqs"
import { useCallback, useMemo } from "react"

export function usePaginationSearchParams() {
  return useQueryStates(
    {
      pageIndex: parseAsIndex.withDefault(0),
      pageSize: parseAsInteger.withDefault(10),
    },
    {
      urlKeys: {
        pageIndex: "page",
        pageSize: "perPage",
      },
    }
  )
}

export function useDataTablePagination() {
  const [_pagination, setPagination] = usePaginationSearchParams()

  const pagination = useMemo<PaginationState>(
    () => ({
      ..._pagination,
      pageIndex: _pagination.pageIndex - 1,
    }),
    [_pagination]
  )

  const onPaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const nextPagination = functionalUpdate(updater, pagination)

      setPagination({
        ...nextPagination,
        pageIndex: nextPagination.pageIndex + 1,
      })
    },
    [pagination, setPagination]
  )

  return { pagination, onPaginationChange }
}

export type LimitOffsetPagination = Record<"limit" | "offset", number>

export function usePagination() {
  const [_pagination] = usePaginationSearchParams()
  return useMemo<LimitOffsetPagination>(
    () => ({
      limit: _pagination.pageSize,
      offset: _pagination.pageIndex * _pagination.pageSize,
    }),
    [_pagination]
  )
}
