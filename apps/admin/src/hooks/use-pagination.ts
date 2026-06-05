import { OnChangeFn, PaginationState } from "@tanstack/react-table"
import { parseAsInteger, useQueryStates } from "nuqs"
import * as React from "react"

const PAGE_INDEX_KEY = "page"
const PAGE_SIZE_KEY = "perPage"

export function usePagination() {
  const [{ pageIndex, pageSize }, setValues] = useQueryStates(
    {
      pageIndex: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
    },
    { urlKeys: { pageIndex: PAGE_INDEX_KEY, pageSize: PAGE_SIZE_KEY } }
  )

  const pagination: PaginationState = React.useMemo<PaginationState>(
    () => ({ pageIndex: pageIndex - 1, pageSize }),
    [pageIndex, pageSize]
  )

  const onPaginationChange: OnChangeFn<PaginationState> = React.useCallback(
    (updaterOrValue) => {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue

      setValues({
        pageIndex: newPagination.pageIndex + 1,
        pageSize: newPagination.pageSize,
      })
    },
    [pagination, setValues]
  )

  return { pagination, onPaginationChange }
}

export function usePaginationValues() {
  const {
    pagination: { pageIndex, pageSize },
  } = usePagination()

  const limitOffset = React.useMemo(
    () => ({ offset: pageIndex * pageSize, limit: pageSize }),
    [pageIndex, pageSize]
  )

  return limitOffset
}
