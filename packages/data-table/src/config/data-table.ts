import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsIsoDate,
  parseAsString,
} from "nuqs"

export const dataTableConfig = {
  filterParsers: {
    text: parseAsString,

    number: parseAsInteger,
    range: parseAsArrayOf(parseAsInteger),

    boolean: parseAsBoolean,

    select: parseAsString,
    "multi-select": parseAsArrayOf(parseAsString),

    date: parseAsIsoDate,
    "date-range": parseAsArrayOf(parseAsIsoDate),
  } as const,
}
