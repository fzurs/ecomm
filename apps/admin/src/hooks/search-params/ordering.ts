import { createParser } from "nuqs";

import { parseAsSort } from "./sorting";

export const parseAsOrdering = createParser({
  ...parseAsSort,
  serialize(value) {
    if (!value.length) return "";
    const sort = value[0];
    return `${sort.desc ? "-" : ""}${sort.id}`;
  },
});
