"use client";

import { useDataTable } from "@/hooks/use-data-table";
import { Customer, useColumns } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const columns = useColumns();

  const table = useDataTable({ data: customers, columns });

  return (
    <div>
      <DataTableToolbar table={table} />
      <DataTable table={table} />
    </div>
  );
}
