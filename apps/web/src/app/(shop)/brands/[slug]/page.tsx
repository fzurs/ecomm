import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { ProductList } from "@/components/product-list"
import { ProductGridSkeleton } from "@/components/products-grid"
import { getAllBrands, getBrand } from "@/lib/cache"

export async function generateStaticParams() {
  const brands = await getAllBrands()
  return brands.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/brands/[slug]">): Promise<Metadata> {
  const brand = await getBrand((await params).slug)
  return brand ? { title: brand.name } : {}
}

export default async function BrandPage({
  params,
  searchParams,
}: PageProps<"/brands/[slug]">) {
  const { slug } = await params
  const brand = await getBrand(slug)
  if (!brand) notFound()

  return (
    <>
      <PageHeader
        breadcrumbs={{
          items: [{ title: "Home", href: "/" }],
          page: brand.name,
        }}
        listsProducts
      />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductList
          pathname={`/brands/${slug}`}
          searchParams={searchParams}
          filters={{ brand: [slug] }}
        />
      </Suspense>
    </>
  )
}
