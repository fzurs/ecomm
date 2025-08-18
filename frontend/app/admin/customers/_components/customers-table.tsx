"use client";

import * as React from "react";

import { customersTableColumns } from "./customers-table-columns";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTable } from "@/hooks/use-data-table";
import { CreateCustomerDrawer } from "./create-customer-drawer";
import { Customer } from "../_lib/customer-schema";
import { DataTableSearchInput } from "@/components/data-table/data-table-search-input";
import { VisibilityState } from "@tanstack/react-table";

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      firstName: false,
      lastName: false,
    });

  const table = useDataTable({
    data: customers,
    columns: customersTableColumns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div className="w-full flex flex-col justify-start gap-6">
      <div className="flex gap-2 px-4 lg:px-6">
        <DataTableSearchInput
          table={table}
          columnId="username"
          placeholder="Search customers..."
          className="max-w-full w-full md:max-w-[300px]"
        />
        <div className="ml-auto flex gap-2">
          <DataTableViewOptions table={table} />
          <CreateCustomerDrawer />
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <DataTable table={table} />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
