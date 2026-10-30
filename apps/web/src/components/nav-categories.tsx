"use client"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"
import React, { use, useContext } from "react"
import { CategoriesContext } from "./categories-provider"
import { usePathname } from "next/navigation"
import { NavSkeleton } from "./nav-skeleton"

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
          <React.Suspense fallback={<NavSkeleton />}>
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
  // On a phone the sidebar is a sheet over the page: close it on the way out.
  const { setOpenMobile } = useSidebar()

  return categories.map((category) => {
    const href = `/${category.slug}`
    return (
      <SidebarMenuItem key={category.id}>
        <SidebarMenuButton
          isActive={pathname === href}
          render={<Link href={href} onClick={() => setOpenMobile(false)} />}
        >
          {category.name}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  })
}
