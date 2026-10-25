"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { productsRetrieveOptions } from "@workspace/api-client/query"
import { useParams } from "next/navigation"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { PackageIcon, StarIcon } from "lucide-react"
import { RowActionsProvider } from "@/context/row-actions-provider"
import { ProductEditDrawer } from "../_components/product-edit-drawer"
import { ProductEditButton } from "../_components/product-buttons"
import { ProductDetails } from "../_components/product-details"
import { ProductDescription } from "../_components/product-description"
import { ProductPrice } from "../_components/product-price"
import { ProductStatusBadge } from "../_lib/product-status"

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product } = useSuspenseQuery(
    productsRetrieveOptions({ path: { slug } })
  )

  return (
    <RowActionsProvider>
      <AppHeader>
        <AppHeaderNav
          parents={[{ label: "Products", href: "/products" }]}
          page={product.name}
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col">
        <div className="flex flex-col gap-8 px-4 py-6 lg:px-6">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-4 @xl/main:gap-6">
              <Avatar shape="square" className="size-24 @xl/main:size-40">
                {product.image && <AvatarImage src={product.image} />}
                <AvatarFallback>
                  <PackageIcon className="size-1/3" />
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-2">
                <div className="typeset">
                  <h1>{product.name}</h1>
                </div>
                <ProductPrice product={product} />
                <div className="flex flex-wrap items-center gap-2">
                  {product.status && (
                    <ProductStatusBadge status={product.status} />
                  )}
                  {product.featured && (
                    <Badge variant="outline">
                      <StarIcon className="fill-yellow-500 stroke-yellow-500 dark:fill-yellow-400 dark:stroke-yellow-400" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <ProductEditButton product={product} />
            </div>
          </div>
          {/* Description */}
          {product.description && (
            <section className="flex flex-col gap-2">
              <div className="typeset">
                <h2>Description</h2>
              </div>
              <ProductDescription description={product.description} />
            </section>
          )}
          {/* Details */}
          <section className="flex flex-col gap-2">
            <div className="typeset">
              <h2>Product details</h2>
            </div>
            <ProductDetails product={product} />
          </section>
        </div>
      </main>
      <ProductEditDrawer />
    </RowActionsProvider>
  )
}
