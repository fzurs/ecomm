import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { X } from "lucide-react"
import type {
  Column,
  ColumnDataType,
  DataTableFilterActions,
  FilterModel,
  FilterStrategy,
  FiltersState,
} from "../core/types"
import { getColumn } from "../lib/helpers"
import type { Locale } from "../lib/i18n"
import { FilterOperator } from "./filter-operator"
import { FilterSubject } from "./filter-subject"
import { FilterValue } from "./filter-value"

interface ActiveFiltersProps<TData> {
  columns: Column<TData>[]
  filters: FiltersState
  actions: DataTableFilterActions
  strategy: FilterStrategy
  locale?: Locale
}

export function ActiveFilters<TData>({
  columns,
  filters,
  actions,
  strategy,
  locale = "en",
}: ActiveFiltersProps<TData>) {
  return (
    <>
      {filters.map((filter) => {
        const id = filter.columnId

        const column = getColumn(columns, id)

        // Skip if no filter value
        if (!filter.values) return null

        return (
          <ActiveFilter
            key={`active-filter-${filter.columnId}`}
            filter={filter}
            column={column}
            actions={actions}
            strategy={strategy}
            locale={locale}
          />
        )
      })}
    </>
  )
}

interface ActiveFilterProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>
  column: Column<TData, TType>
  actions: DataTableFilterActions
  strategy: FilterStrategy
  locale?: Locale
}

// Generic render function for a filter with type-safe value
export function ActiveFilter<TData, TType extends ColumnDataType>({
  filter,
  column,
  actions,
  strategy,
  locale = "en",
}: ActiveFilterProps<TData, TType>) {
  return (
    <div className="flex h-8 items-center rounded-2xl border border-border bg-background text-xs shadow-xs">
      <FilterSubject column={column} />
      <Separator orientation="vertical" />
      <FilterOperator
        filter={filter}
        column={column}
        actions={actions}
        locale={locale}
      />
      <Separator orientation="vertical" />
      <FilterValue
        filter={filter}
        column={column}
        actions={actions}
        strategy={strategy}
        locale={locale}
      />
      <Separator orientation="vertical" />
      <Button
        variant="ghost"
        className="h-full w-7 rounded-none rounded-r-2xl text-xs"
        onClick={() => actions.removeFilter(filter.columnId)}
      >
        <X className="size-4 -translate-x-0.5" />
      </Button>
    </div>
  )
}
