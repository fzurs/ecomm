"use client"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"
import React, { use, useContext } from "react"
import { CategoriesContext } from "./categories-provider"
import { usePathname } from "next/navigation"

function useCategories() {
  const categoriesPromise = useContext(CategoriesContext)
  if (!categoriesPromise) return []
  return use(categoriesPromise)
}

export function NavCategories() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Categories</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <React.Suspense
            fallback={Array.from({ length: 3 }).map((_, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton>...</SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          >
            <NavCategoriesItems />
          </React.Suspense>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function NavCategoriesItems() {
  const categories = useCategories()

  const pathname = usePathname()

  return categories.map((category) => {
    const href = `/${category.slug}`
    return (
      <SidebarMenuItem key={category.id}>
        <SidebarMenuButton isActive={pathname === href} asChild>
          <Link href={href}>{category.name}</Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  })
}
