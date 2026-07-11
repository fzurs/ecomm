import { OutOfStockAlert } from "@/components/out-of-stock-alert"
import { PageHeader } from "@/components/page-header"
import { ProductPrice } from "@/components/product-price"
import { getProduct } from "@/lib/cache"
import { notFound } from "next/navigation"

export default async function ProductPage(props: PageProps<"/[slug]">) {
  const params = await props.params
  const product = await getProduct(params.slug)
  if (!product) notFound()

  return (
    <>
      <PageHeader
        breadcrumbs={{
          items: [{ title: "Home", href: "/" }],
          page: product.name,
        }}
      />
      <div className="mx-auto w-full max-w-2xl space-y-6 p-4 lg:p-6">
        <img
          src={product.image ?? ""}
          className="aspect-video w-full rounded-xl object-cover"
        />
        <h1 className="text-4xl font-extrabold tracking-tight text-balance">
          {product.name}
        </h1>
        <p className="text-xl leading-7 text-muted-foreground">
          {product.description}
        </p>
        {product.status === "out_of_stock" && <OutOfStockAlert />}
        <ProductPrice {...product} size="lg" />
      </div>
    </>
  )
}
