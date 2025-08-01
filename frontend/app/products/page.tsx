import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductList } from "./product-list";
import { SampleProductsList } from "./sample-product-list";
import { SiteHeader } from "@/components/site-header";

export default function ProductsPage() {
  const isMock = process.env.NEXT_PUBLIC_IS_MOCK === "true";

  return (
    <>
      <SiteHeader title="Products" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6 flex gap-4 lg:gap-6 w-full justify-between">
              <Input placeholder="Search products..." className="max-w-sm" />
              <Button size="lg" asChild>
                <Link href="/products/add">
                  <PlusIcon />
                  Add Product
                </Link>
              </Button>
            </div>
            {/* <ProductList /> */}
            <SampleProductsList />
          </div>
        </div>
      </div>
    </>
  );
}
