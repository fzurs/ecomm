import { SiteHeader } from "@/components/site-header";
import { AddProductForm } from "./form";

export default function CreateProductPage() {
  return (
    <>
      <SiteHeader title="Products" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6 max-w-4xl">
              <h1 className="text-2xl font-bold mb-6">Agregar nuevo producto</h1>
              <AddProductForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
