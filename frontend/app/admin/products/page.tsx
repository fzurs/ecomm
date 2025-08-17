"use client";

import * as React from "react";
import { ProductsTable } from "./_components/products-table";
import { SiteHeader } from "@/components/site-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Product, productSchema } from "./_lib/types";
import z from "zod";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch("https://dummyjson.com/products");

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const rawData = await response.json();

  return z.array(productSchema).parse(rawData.products);
};

function useProducts() {
  return useSuspenseQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

function ProductsLoadingSkeleton() {
  return (
    <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
      <DataTableSkeleton />
    </div>
  );
}

function ProductsContent() {
  const { data } = useProducts();

  return <ProductsTable products={data} />;
}

export default function ProductsPage() {
  return (
    <>
      <SiteHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>
                Products
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </SiteHeader>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <React.Suspense fallback={<ProductsLoadingSkeleton />}>
              <ProductsContent />
            </React.Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
