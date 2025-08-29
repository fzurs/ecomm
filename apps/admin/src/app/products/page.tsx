"use client";

import * as React from "react";
import { productsQueryOptions } from "@/lib/queries";
import { ProductsTable } from "./_components/products-table";
import { SiteHeader } from "@/components/site-header";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function Page() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);

  return (
    <>
      <SiteHeader title="Products" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <React.Suspense>
              <ProductsTable products={products} />
            </React.Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
