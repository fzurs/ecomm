"use client"

import type {
  Column,
  DataTableFilterActions,
  FilterStrategy,
  FiltersState,
} from "../core/types"
import type { Locale } from "../lib/i18n"
import { ActiveFilters } from "./active-filters"
import { FilterActions } from "./filter-actions"
import { FilterSelector } from "./filter-selector"

interface DataTableFilterProps<TData> {
  columns: Column<TData>[]
  filters: FiltersState
  actions: DataTableFilterActions
  strategy: FilterStrategy
  locale?: Locale
}

export function DataTableFilter<TData>({
  columns,
  filters,
  actions,
  strategy,
  locale = "en",
}: DataTableFilterProps<TData>) {
  // No wrapper, on every screen size: the selector, the chips and Clear join
  // the container's flex row (DataTableAdvancedToolbar's left section), which
  // wraps them. bazza scrolled the chips sideways on mobile instead.
  return (
    <>
      <FilterSelector
        columns={columns}
        filters={filters}
        actions={actions}
        strategy={strategy}
        locale={locale}
      />
      <ActiveFilters
        columns={columns}
        filters={filters}
        actions={actions}
        strategy={strategy}
        locale={locale}
      />
      <FilterActions
        hasFilters={filters.length > 0}
        actions={actions}
        locale={locale}
      />
    </>
  )
}
