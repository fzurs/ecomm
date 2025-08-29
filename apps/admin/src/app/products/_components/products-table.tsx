"use client";

import * as React from "react";

import { productsTableColumns } from "./products-table-columns";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTable } from "@/hooks/use-data-table";
import { CreateProductDrawer } from "./create-product-drawer";
import { Product } from "@sdk";
import { DataTableSearchInput } from "@/components/data-table/data-table-search-input";
import { DataTableCategoryFilter } from "./data-table-category-filter";

export function ProductsTable({ products }: { products: Product[] }) {
  const table = useDataTable({
    data: products,
    columns: productsTableColumns,
  });

  return (
    <div className="w-full flex flex-col justify-start gap-6">
      <div className="flex gap-2 px-4 lg:px-6">
        <DataTableSearchInput
          table={table}
          columnId="name"
          placeholder="Search products..."
          className="max-w-full w-full md:max-w-[300px]"
        />
        <div className="ml-auto flex gap-2">
          <DataTableCategoryFilter table={table} />
          <DataTableViewOptions table={table} />
          <CreateProductDrawer />
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <DataTable table={table} />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
