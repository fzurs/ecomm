import { AppSidebar } from "@/components/app-sidebar"
import { OutOfStockAlert } from "@/components/out-of-stock-alert"
import { PageHeader } from "@/components/page-header"
import { apiClient } from "@/lib/api-client"
import { isOutOfStock } from "@/lib/utils"
import { Badge } from "@workspace/ui/components/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import { Skeleton } from "@workspace/ui/components/skeleton"
import Link from "next/link"
import { connection } from "next/server"
import { Suspense } from "react"

async function getProduct(slug: string) {
  "use cache"
  return apiClient.products_retrieve({ params: { slug } })
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  await connection()

  return (
    <>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Products</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <Suspense fallback={<Skeleton className="h-4 w-10" />}>
              <ProductBreadcrumbPage params={props.params} />
            </Suspense>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
          <Suspense>
            <ProductContent params={props.params} />
          </Suspense>
        </SidebarInset>
      </div>
    </>
  )
}

async function ProductBreadcrumbPage(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const product = await getProduct(params.slug)

  return <BreadcrumbPage>{product.name}</BreadcrumbPage>
}

async function ProductContent(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const product = await getProduct(params.slug)

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {isOutOfStock(product.status) && <OutOfStockAlert />}
      <div className="flex flex-wrap items-start gap-2">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        {product.brand && (
          <Badge variant="secondary">{product.brand.name}</Badge>
        )}
      </div>
      {product.description && (
        <p className="text-muted-foreground">{product.description}</p>
      )}
    </div>
  )
}
