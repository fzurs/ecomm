"use client";

import * as React from "react";
import { CustomersTable } from "./_components/customers-table";
import { SiteHeader } from "@/components/site-header";
import { customerSchema } from "./_lib/customer-schema";
import z from "zod";
import data from "./_lib/customers.json";
import { CustomerMetricsCards } from "./_components/customer-metrics-cards";

export default function CustomersPage() {
  const customers = z.array(customerSchema).parse(data);

  return (
    <>
      <SiteHeader title="Customers" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <CustomerMetricsCards customers={customers} />
            <React.Suspense>
              <CustomersTable customers={customers} />
            </React.Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
