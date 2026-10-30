import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { OutOfStockAlert } from "@/components/out-of-stock-alert"
import { Crumbs } from "@/components/page-title"
import { ProductImage } from "@/components/product-image"
import { ProductPrice } from "@/components/product-price"
import { getProduct, getProductSlugs } from "@/lib/cache"
import { brandHref } from "@/lib/product-params"

export async function generateStaticParams() {
  const slugs = await getProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.description ?? undefined,
  }
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const product = await getProduct((await params).slug)
  if (!product) notFound()

  const { brand, category } = product

  return (
    <>
      <Crumbs
        crumbs={[
          { title: "Home", href: "/" },
          ...(category
            ? [{ title: category.name, href: `/${category.slug}` }]
            : []),
        ]}
        page={product.name}
      />
      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="rounded-xl bg-white ring-1 ring-foreground/10"
        />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            {brand && (
              <Link
                href={brandHref(brand.slug)}
                className="w-fit text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                {brand.name}
              </Link>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-balance">
              {product.name}
            </h1>
            {product.sku && (
              <p className="text-xs text-muted-foreground">SKU {product.sku}</p>
            )}
          </div>
          <ProductPrice product={product} size="lg" />
          {product.status === "out_of_stock" && <OutOfStockAlert />}
          {product.description && (
            <p className="leading-7 whitespace-pre-line text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
