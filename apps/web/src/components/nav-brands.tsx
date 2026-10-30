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
import { BrandsContext } from "./brands-provider"
import { usePathname } from "next/navigation"
import { NavSkeleton } from "./nav-skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { ChevronRight } from "lucide-react"

function useBrands() {
  const brandsPromise = useContext(BrandsContext)
  if (!brandsPromise) return []
  return use(brandsPromise)
}

export function NavBrands() {
  // Open on a brand's page, so it shows which one.
  const onBrand = usePathname().startsWith("/brands/")
  return (
    <Collapsible defaultOpen={onBrand} className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel
          className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          render={<CollapsibleTrigger />}
        >
          Brands{" "}
          <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              <React.Suspense fallback={<NavSkeleton />}>
                <NavBrandsItems />
              </React.Suspense>
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

function NavBrandsItems() {
  const brands = useBrands()

  const pathname = usePathname()
  // On a phone the sidebar is a sheet over the page: close it on the way out.
  const { setOpenMobile } = useSidebar()

  return brands.map((brand) => {
    const href = `/brands/${brand.slug}`
    return (
      <SidebarMenuItem key={brand.id}>
        <SidebarMenuButton
          isActive={pathname === href}
          render={<Link href={href} onClick={() => setOpenMobile(false)} />}
        >
          {brand.name}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  })
}
