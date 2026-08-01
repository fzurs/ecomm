import { parseAsInteger, parseAsString } from "nuqs"

export const defaultParsers = {
  text: parseAsString,
  number: parseAsInteger,
}

export type FilterVariant = keyof typeof defaultParsers
