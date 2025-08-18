import { SiteHeader } from "@/components/site-header";

export default function Page() {
  return (
    <>
      <SiteHeader title="Admin" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="container max-w-4xl mx-auto px-4 lg:px-6">
              <h1 className="text-3xl font-bold tracking-tight text-balance scroll-m-20">
                ¡Te damos la bienvenida al panel de administración!
              </h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
