import { createParser } from "nuqs"
import type { FilterModel, FiltersState } from "../core/types"

const types = new Set(["text", "number", "date", "option", "multiOption"])

function isFilterModel(value: unknown): value is FilterModel {
  if (typeof value !== "object" || value === null) return false
  const { columnId, type, operator, values } = value as Record<string, unknown>
  return (
    typeof columnId === "string" &&
    typeof type === "string" &&
    types.has(type) &&
    typeof operator === "string" &&
    Array.isArray(values)
  )
}

/**
 * The filters state as JSON in the URL. Date values are revived as `Date`;
 * an invalid value drops the whole param.
 */
export const parseAsFilters = createParser<FiltersState>({
  parse: (value) => {
    try {
      const parsed: unknown = JSON.parse(value)
      if (!Array.isArray(parsed) || !parsed.every(isFilterModel)) return null
      return parsed.map((filter) =>
        filter.type === "date"
          ? { ...filter, values: filter.values.map((v) => new Date(v)) }
          : filter
      )
    } catch {
      return null
    }
  },
  serialize: (value) => JSON.stringify(value),
  eq: (a, b) => JSON.stringify(a) === JSON.stringify(b),
})
