import { format, parseISO } from "date-fns"
import { createParser } from "nuqs"

export const parseAsDate = createParser({
  parse: parseISO,
  serialize: (date: Date) => format(date, "yyyy-MM-dd"),
  eq: (a: Date, b: Date) => a.getTime() === b.getTime(), // necesario para clearOnDefault
})
