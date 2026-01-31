import { DataTableConfig } from "@/config/data-table";
import {
  UseInfiniteQueryOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { RowData } from "@tanstack/react-table";
import { SingleParser } from "nuqs";

export type OptionAsQueryOptions = {
  getItemsInfiniteQueryOptions: ({
    search,
  }: {
    search?: string;
    pageSize?: number;
  }) => UseInfiniteQueryOptions<any, any, Array<any>, any, any>;
  getItemQueryOptions: (
    value: Option["value"],
  ) => UseQueryOptions<any, any, any, any>;
  transformItemToOption: (item: any) => Option;
};

declare module "@tanstack/react-table" {
  // biome-ignore lint/correctness/noUnusedVariables: TData is used in the TableMeta interface
  interface TableMeta<TData extends RowData = RowData> {
    isPending?: boolean;
  }

  // biome-ignore lint/correctness/noUnusedVariables: TValue is used in the ColumnMeta interface
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    variant?: FilterVariant;
    options?: Option[] | OptionAsQueryOptions;
    range?: [number, number];
    unit?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    filterParser?: SingleParser<any>;
  }
}

export interface Option {
  label: string;
  value: string | number;
  count?: number;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export type FilterVariant = DataTableConfig["filterVariants"][number];
