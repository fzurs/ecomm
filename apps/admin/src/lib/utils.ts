import { PaginationState, ColumnDef } from "@tanstack/react-table";

export function getPageCount(count: number, pageSize: number) {
  return Math.ceil(count / pageSize);
}

export function toLimitOffset({ pageIndex, pageSize }: PaginationState) {
  return {
    limit: pageSize,
    offset: pageIndex * pageSize,
  };
}

export function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function defineColumns<T>() {
  return <const C extends readonly ColumnDef<T>[]>(columns: C) => columns;
}
