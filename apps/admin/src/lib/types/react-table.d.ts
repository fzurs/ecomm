import "@tanstack/react-table";
import { LucideIcon } from "lucide-react";

type Option = { label: string; value: string; icon?: LucideIcon };

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    variant?: "text" | "select" | "multiSelect" | "globalFilter";
    label?: string;
    placeholder?: string;
    options?: Option[];
  }
}
