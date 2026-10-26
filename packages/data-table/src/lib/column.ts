import type { Column, RowData } from "@tanstack/react-table"
import type { DataTableFeatures } from "../types/data-table"

/**
 * The column's name in menus (view options, header menu): `meta.label`, else
 * the header when it's a string. Falls back to the raw id, so a missing label
 * shows up instead of passing for a name.
 */
export function getColumnLabel<TData extends RowData>(
  column: Column<DataTableFeatures, TData>
) {
  const { header, meta } = column.columnDef
  return meta?.label ?? (typeof header === "string" ? header : column.id)
}
