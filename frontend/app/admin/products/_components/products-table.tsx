"use client";

import * as React from "react";

import { productsTableColumns } from "./products-table-columns";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTable } from "@/hooks/use-data-table";
import { CreateProductDrawner } from "./create-product-drawner";
import { Product } from "../_lib/types";
import { DataTableFilterInput } from "@/components/data-table/data-table-filter-input";

export function ProductsTable({ data }: { data: Product[] }) {
  const table = useDataTable({ data, columns: productsTableColumns });

  return (
    <div className="w-full flex flex-col justify-start gap-4">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <DataTableFilterInput table={table} />
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
          <CreateProductDrawner />
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <DataTable table={table} />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
