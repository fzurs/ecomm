import Link from "next/link"
import { PageTitle } from "@/components/page-title"
import { getAllBrands } from "@/lib/cache"

export const metadata = { title: "Brands" }

export default async function BrandsPage() {
  const brands = await getAllBrands()

  return (
    <>
      <PageTitle crumbs={[{ title: "Home", href: "/" }]} title="Brands" />
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand) => (
          <li key={brand.id}>
            <Link
              href={`/brands/${brand.slug}`}
              className="flex h-24 items-center justify-center rounded-xl text-lg font-semibold ring-1 ring-foreground/10 transition-shadow outline-none hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {brand.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
