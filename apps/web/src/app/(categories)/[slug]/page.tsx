import { PageHeader } from "@/components/page-header"
import { ProductsGrid } from "@/components/products-grid"
import { getCategory, getProducts } from "@/lib/cache"
import { notFound } from "next/navigation"

const breadcrumbs = {
  items: [{ title: "Home", href: "/" }],
}

export default async function CategoryPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const products = await getProducts({ category: [slug] })

  return (
    <>
      <PageHeader breadcrumbs={{ ...breadcrumbs, page: category.name }} />
      <ProductsGrid products={products.results} />
    </>
  )
}
