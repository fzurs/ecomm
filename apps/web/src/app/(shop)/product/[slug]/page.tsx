import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { OutOfStockAlert } from "@/components/out-of-stock-alert"
import { AddToCart } from "./_components/add-to-cart"
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
      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <ProductImage
          src={product.image}
          alt={product.name}
          // Half of the page from md (main is max-w-7xl), all of it below.
          sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
          preload
          className="rounded-xl bg-white ring-1 ring-foreground/10"
        />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            {(brand || category) && (
              <p className="flex gap-2 text-sm text-muted-foreground *:underline-offset-4 *:hover:underline">
                {brand && (
                  <Link href={brandHref(brand.slug)}>{brand.name}</Link>
                )}
                {brand && category && <span aria-hidden>·</span>}
                {category && (
                  <Link href={`/${category.slug}`}>{category.name}</Link>
                )}
              </p>
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
          {/* What the API sells: active and with a price (checkout.services.is_purchasable). */}
          {product.status === "active" && !!product.price && (
            <AddToCart productId={product.id} productName={product.name} />
          )}
          {product.description && (
            // Plain text: a blank line starts a paragraph, a line break stays.
            <div className="typeset">
              {product.description.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i} className="whitespace-pre-line">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
