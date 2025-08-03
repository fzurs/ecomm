import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { ChartAreaDefault } from "./chart-area-default";
import { ChartBarHorizontal } from "./chart-bar-horizontal";
import { ChartPieSeparatorNone } from "./chart-pie-separator-none";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function Page() {
  return (
    <>
      <SiteHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Informes y estadísticas</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </SiteHeader>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <div className="px-4 lg:px-6 grid grid-cols-1 gap-6 @5xl/main:grid-cols-3">
              <ChartAreaDefault />
              <ChartBarHorizontal />
              <ChartPieSeparatorNone />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
