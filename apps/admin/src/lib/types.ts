import "@tanstack/react-table";
import { RowData } from "@tanstack/react-table";

/* eslint-disable */
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    variant?: "status" | "search";
  }
}
/* eslint-enable */
