import { OutOfStockAlert } from "@/components/out-of-stock-alert"
import { PageHeader } from "@/components/page-header"
import { getProduct } from "@/lib/cache"
import { notFound } from "next/navigation"

export default async function ProductPage(props: PageProps<"/[slug]">) {
  const params = await props.params
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  return (
    <>
      <PageHeader
        breadcrumbs={{
          items: [{ title: "Home", href: "/" }],
          page: product.name,
        }}
      />
      <div className="mx-auto w-full max-w-2xl p-4 lg:p-6">
        <div className="mb-6 flex justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-balance">
              {product.name}
            </h1>
            <p className="mt-6 text-xl leading-7 text-muted-foreground">
              {product.description}
            </p>
          </div>
          <img src={product.image ?? ""} className="rounded-xl" />
        </div>
        {product.status === "out_of_stock" && <OutOfStockAlert />}
      </div>
    </>
  )
}
