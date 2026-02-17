"use client";

import { DataTable } from "@/components/data-table/data-table";
import { QuickCreateProductDialog } from "@/components/quick-create-product-dialog";
import {
  PageAction,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page-header";
import { useColumnFilterValues } from "@/hooks/use-column-filters";
import { useDataTable } from "@/hooks/use-data-table";
import { usePaginationValues } from "@/hooks/use-pagination";
import { useSortingValues } from "@/hooks/use-sorting";
import { useProducts } from "@/lib/query-options";

import { columns } from "./columns";

export default function Page() {
  const pagination = usePaginationValues();
  const { status, ...columnFilters } = useColumnFilterValues(columns);
  const sorting = useSortingValues();
  const { data } = useProducts({
    ...pagination,
    ...columnFilters,
    ...sorting,
  });
  const table = useDataTable({ data, columns });

  return (
    <>
      <PageHeader>
        <PageTitle>Products</PageTitle>
        <PageAction>
          <QuickCreateProductDialog />
        </PageAction>
      </PageHeader>
      <PageContent>
        <DataTable table={table} />
      </PageContent>
    </>
  );
}
