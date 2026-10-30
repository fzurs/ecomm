import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
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
      <div className="typeset">
        <h1>{category.name}</h1>
        {category.description && <p>{category.description}</p>}
      </div>
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
