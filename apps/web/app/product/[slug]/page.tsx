import { AppSidebar } from "@/components/app-sidebar"
import { OutOfStockAlert } from "@/components/out-of-stock-alert"
import { PageHeader } from "@/components/page-header"
import { apiClient } from "@/lib/api-client"
import { isOutOfStock } from "@/lib/utils"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import { AlertTriangleIcon } from "lucide-react"

async function getProduct(slug: string) {
  "use cache"
  return apiClient.products_retrieve({ params: { slug } })
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const params = await props.params
  const product = await getProduct(params.slug)

  return (
    <>
      <PageHeader
        breadcrumbs={{
          items: [{ href: "/", title: "Products" }],
          page: product.name,
        }}
      />
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
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
        </SidebarInset>
      </div>
    </>
  )
}
