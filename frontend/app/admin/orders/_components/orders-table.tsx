"use client";

import * as React from "react";

import { ordersTableColumns } from "./orders-table-columns";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTable } from "@/hooks/use-data-table";
import { Order } from "../_lib/order-schema";
import { Button } from "@/components/ui/button";
import { IconShoppingBagPlus } from "@tabler/icons-react";

export function OrdersTable({ orders }: { orders: Order[] }) {
  const table = useDataTable({
    data: orders,
    columns: ordersTableColumns,
  });

  return (
    <div className="w-full flex flex-col justify-start gap-6">
      <div className="flex gap-2 px-4 lg:px-6">
        <div className="ml-auto flex gap-2">
          <DataTableViewOptions table={table} />
          <Button variant="outline" className="size-9 md:w-auto">
            <IconShoppingBagPlus />
            <span className="sr-only md:not-sr-only">Create new Order</span>
          </Button>
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <DataTable table={table} />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
