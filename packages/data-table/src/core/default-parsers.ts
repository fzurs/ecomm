import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsIsoDate,
  parseAsString,
} from "nuqs"

export const defaultParsers = {
  text: parseAsString,

  number: parseAsInteger,
  range: parseAsArrayOf(parseAsInteger),

  boolean: parseAsBoolean,

  select: parseAsString,
  "multi-select": parseAsArrayOf(parseAsString),

  date: parseAsIsoDate,
  "date-range": parseAsArrayOf(parseAsIsoDate),
}

export type FilterVariant = keyof typeof defaultParsers
