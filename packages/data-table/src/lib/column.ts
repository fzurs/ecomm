import { Column } from "@tanstack/react-table"

/**
 * The column's name in menus (view options, header menu): `meta.label`, else
 * the header when it's a string. Falls back to the raw id, so a missing label
 * shows up instead of passing for a name.
 */
export function getColumnLabel<TData>(column: Column<TData>) {
  const { header, meta } = column.columnDef
  return meta?.label ?? (typeof header === "string" ? header : column.id)
}
