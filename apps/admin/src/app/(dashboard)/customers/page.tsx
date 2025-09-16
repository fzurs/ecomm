"use client";

import { useQuery } from "@tanstack/react-query";

import { getCustomersQueryOptions } from "@/lib/queries";

import {
  useDataTable,
  usePaginationSearchParams,
} from "@/hooks/use-data-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { SearchFilter } from "@/components/search-filter";
import { SiteHeader } from "@/components/site-header";

import { columns } from "./columns";

export default function Page() {
  const pagination = usePaginationSearchParams()[0];

  const { data } = useQuery(
    getCustomersQueryOptions({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    }),
  );

  const table = useDataTable({ data, columns });

  return (
    <>
      <SiteHeader title="Customers" />
      <div className="@container/main flex flex-1 flex-col py-4 gap-6 md:py-6">
        <div className="flex flex-col gap-2 md:gap-4 px-4 lg:px-6 md:flex-row-reverse">
          <div className="flex gap-2 md:gap-4 w-full justify-between">
            <SearchFilter placeholder="Search for a customer..." />
            <DataTableViewOptions table={table} />
          </div>
        </div>
        <div className="relative flex flex-col gap-4 px-4 lg:px-6">
          <DataTable table={table} />
          <DataTablePagination table={table} />
        </div>
      </div>
    </>
  );
}
