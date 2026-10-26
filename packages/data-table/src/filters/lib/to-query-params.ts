import { formatISO } from "date-fns"
import type { FilterModel, FiltersState } from "../core/types"

/**
 * Param suffix per operator, following the API's `OperatorFilterSet`
 * (apps/api/config/filters.py): `price`, `price__not`, `price__range`...
 */
const operatorSuffixes: Record<string, Record<string, string>> = {
  text: {
    contains: "__icontains",
    "does not contain": "__not_icontains",
  },
  number: {
    is: "",
    "is not": "__not",
    "is less than": "__lt",
    "is less than or equal to": "__lte",
    "is greater than": "__gt",
    "is greater than or equal to": "__gte",
    "is between": "__range",
    "is not between": "__not_range",
  },
  date: {
    is: "",
    "is not": "__not",
    "is before": "__lt",
    "is on or before": "__lte",
    "is after": "__gt",
    "is on or after": "__gte",
    "is between": "__range",
    "is not between": "__not_range",
  },
  option: {
    is: "",
    "is any of": "",
    "is not": "__not",
    "is none of": "__not",
  },
}

const rangeSuffixes = new Set(["__range", "__not_range"])

function formatValue(filter: FilterModel, value: unknown) {
  if (filter.type === "date") {
    return formatISO(value as Date, { representation: "date" })
  }
  return value
}

/**
 * Turns the filters state into the API's query params. Filters without values
 * (or with an empty text) are left out. `params` maps a column id to the API
 * param when they differ.
 */
export function toQueryParams(
  filters: FiltersState,
  params: Record<string, string> = {}
) {
  const query: Record<string, unknown> = {}

  for (const filter of filters) {
    const suffix = operatorSuffixes[filter.type]?.[filter.operator]
    if (suffix === undefined) continue

    const values = filter.values.filter((value) => value !== "")
    if (values.length === 0) continue

    const name = (params[filter.columnId] ?? filter.columnId) + suffix
    const formatted = values.map((value) => formatValue(filter, value))

    if (filter.type === "option") query[name] = formatted
    else if (rangeSuffixes.has(suffix)) {
      if (formatted.length < 2) continue
      query[name] = formatted.slice(0, 2)
    } else query[name] = formatted[0]
  }

  return query
}
