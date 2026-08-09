import { ColumnSort } from "@tanstack/react-table"
import { createParser } from "nuqs"

export const parseAsColumnSort = createParser<ColumnSort>({
  parse: (value) => {
    const [id, direction] = value.split(".")
    if (!id || (direction !== "asc" && direction !== "desc")) {
      return null
    }
    return { id, desc: direction === "desc" }
  },
  serialize: ({ id, desc }) => `${id}.${desc ? "desc" : "asc"}`,
})
