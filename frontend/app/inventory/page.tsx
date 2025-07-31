"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "./data-table";
import { inventoryApi } from "@/lib/client";
import { columns } from "./columns";
import { SiteHeader } from "@/components/site-header";
import data from "./data.json"

export default function Page() {
  return (
    <>
      <SiteHeader title="Inventory" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="px-4 lg:px-6">
              <InventoryList />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InventoryList() {
  // const { data, isPending, error } = useSuspenseQuery({
  //   queryKey: [inventoryApi.inventoryList.name],
  //   queryFn: () => inventoryApi.inventoryList().then((res) => res.data),
  // });

  return <DataTable columns={columns} data={data} />;
}
