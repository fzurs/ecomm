import {
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table"

/**
 * The TanStack Table features every data table uses: pagination and sorting
 * (both manual, done by the API) and column visibility. No row models: the
 * API already returns the page, sorted and filtered.
 */
export const dataTableFeatures = tableFeatures({
  rowPaginationFeature,
  rowSortingFeature,
  columnVisibilityFeature,
})
