import { AppSidebar } from "@/components/app-sidebar"
import { OutOfStockAlert } from "@/components/out-of-stock-alert"
import { PageHeader } from "@/components/page-header"
import { getProduct } from "@/lib/cache"
import { SidebarInset } from "@workspace/ui/components/sidebar"

export default async function ProductPage(props: PageProps<"/[slug]">) {
  const params = await props.params
  const product = await getProduct(params.slug)

  return (
    <>
      <PageHeader
        breadcrumbs={{
          items: [{ title: "Home", href: "/" }],
          page: product.name,
        }}
      />
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
          <div className="mx-auto w-full max-w-2xl p-4 lg:p-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-balance">
              {product.name}
            </h1>
            <p className="my-6 text-xl leading-7 text-muted-foreground">
              {product.description}
            </p>
            {product.status === "out_of_stock" && <OutOfStockAlert />}
          </div>
        </SidebarInset>
      </div>
    </>
  )
}
