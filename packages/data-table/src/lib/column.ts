import { Column } from "@tanstack/react-table"
import { capitalize } from "./utils"

export function getColumnLabel<TData>(column: Column<TData>) {
  if (typeof column.columnDef.header === "string") {
    return column.columnDef.header
  }
  return capitalize(column.id.replaceAll("_", " "))
}
