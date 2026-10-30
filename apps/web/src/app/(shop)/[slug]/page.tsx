import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { ProductList } from "@/components/product-list"
import { ProductGridSkeleton } from "@/components/products-grid"
import { getAllCategories, getCategory } from "@/lib/cache"

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const category = await getCategory((await params).slug)
  if (!category) return {}
  return {
    title: category.name,
    description: category.description ?? undefined,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/[slug]">) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()

  return (
    <>
      <PageHeader
        breadcrumbs={{
          items: [{ title: "Home", href: "/" }],
          page: category.name,
        }}
        listsProducts
      />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductList
          pathname={`/${slug}`}
          searchParams={searchParams}
          filters={{ category: [slug] }}
        />
      </Suspense>
    </>
  )
}
