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
import { BrandsContext } from "./brands-provider"
import { usePathname } from "next/navigation"
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
  return (
    <Collapsible title="brands" className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel
          asChild
          className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <CollapsibleTrigger>
            Brands{" "}
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              <React.Suspense
                fallback={Array.from({ length: 3 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton>...</SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              >
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

  return brands.map((brand) => {
    const href = `/brands/${brand.slug}`
    return (
      <SidebarMenuItem key={brand.id}>
        <SidebarMenuButton isActive={pathname === href} asChild>
          <Link href={href}>{brand.name}</Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  })
}
