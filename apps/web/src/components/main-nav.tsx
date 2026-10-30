"use client"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@workspace/ui/components/navigation-menu"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "cn"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import * as React from "react"
import { useBrands } from "./brands-provider"
import { useCategories } from "./categories-provider"

/** The header's menu, from md up: categories, brands and the sale. */
export function MainNav({ className }: { className?: string }) {
  return (
    <NavigationMenu className={className}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <React.Suspense fallback={<MenuSkeleton />}>
              <CategoryLinks />
            </React.Suspense>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Brands</NavigationMenuTrigger>
          <NavigationMenuContent>
            <React.Suspense fallback={<MenuSkeleton />}>
              <BrandLinks />
            </React.Suspense>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <React.Suspense fallback={<SaleLink active={false} />}>
            <ActiveSaleLink />
          </React.Suspense>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function CategoryLinks() {
  const categories = useCategories()
  const pathname = usePathname()
  return (
    <ul className="grid w-[min(36rem,calc(100vw-2rem))] gap-1 sm:grid-cols-2">
      {categories.map((category) => (
        <li key={category.id}>
          <NavigationMenuLink
            closeOnClick
            active={pathname === `/${category.slug}`}
            render={<Link href={`/${category.slug}`} />}
            className="flex-col items-start gap-0.5"
          >
            <span className="font-medium">{category.name}</span>
            {category.description && (
              <span className="line-clamp-2 text-xs text-muted-foreground">
                {category.description}
              </span>
            )}
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  )
}

function BrandLinks() {
  const brands = useBrands()
  const pathname = usePathname()
  return (
    <div className="flex w-72 flex-col gap-1">
      <ul className="grid grid-cols-2 gap-1">
        {brands.map((brand) => (
          <li key={brand.id}>
            <NavigationMenuLink
              closeOnClick
              active={pathname === `/brands/${brand.slug}`}
              render={<Link href={`/brands/${brand.slug}`} />}
            >
              {brand.name}
            </NavigationMenuLink>
          </li>
        ))}
      </ul>
      <NavigationMenuLink
        closeOnClick
        render={<Link href="/brands" />}
        className="border-t pt-2 font-medium"
      >
        All brands
      </NavigationMenuLink>
    </div>
  )
}

// useSearchParams: on its own <Suspense>, so the menu doesn't wait for the URL.
function ActiveSaleLink() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = pathname === "/" && searchParams.get("on_sale") === "true"
  return <SaleLink active={active} />
}

function SaleLink({ active }: { active: boolean }) {
  return (
    <NavigationMenuLink
      active={active}
      render={<Link href="/?on_sale=true" />}
      className={cn(navigationMenuTriggerStyle(), "text-destructive")}
    >
      On sale
    </NavigationMenuLink>
  )
}

function MenuSkeleton() {
  return (
    <div className="flex w-72 flex-col gap-2 p-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
