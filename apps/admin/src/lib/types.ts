import "@tanstack/react-table";
import { RowData } from "@tanstack/react-table";

export interface Option {
  label: string;
  value: string;
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    variant?: "text" | "select";
    options?: Option[];
  }
}
