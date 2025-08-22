"use client";

import * as React from "react";
import { OrdersTable } from "./_components/orders-table";
import { SiteHeader } from "@/components/site-header";
import { OrderSchema } from "./_lib/order-schema";
import z from "zod";
import data from "./_lib/orders.json";

export default function OrdersPage() {
  const orders = z.array(OrderSchema).parse(data);

  return (
    <>
      <SiteHeader title="Orders" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <React.Suspense>
              <OrdersTable orders={orders} />
            </React.Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
