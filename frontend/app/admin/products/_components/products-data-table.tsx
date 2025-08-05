"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";

import { columns } from "./product-columns";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { DataTableProvider } from "@/components/data-table/data-table-provider";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTableLogic } from "@/hooks/use-data-table-logic";
import { CreateProductDrawner } from "./create-product-drawner";
import { Product } from "../_lib/types";

export function ProductsDataTable({ data }: { data: Product[] }) {
  const table = useDataTableLogic({ data, columns });

  return (
    <DataTableProvider table={table}>
      <div className="w-full flex flex-col justify-start gap-6">
        <div className="flex items-center justify-between px-4 lg:px-6">
          <Input
            placeholder="Buscar productos..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm h-8"
          />
          <div className="flex items-center gap-2">
            <DataTableViewOptions />
            <CreateProductDrawner />
          </div>
        </div>
        <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <DataTable />
          <DataTablePagination />
        </div>
      </div>
    </DataTableProvider>
  );
}
