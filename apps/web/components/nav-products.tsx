"use client"

import { ChevronRight, Package } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { useSidebarItems } from "./sidebar-items-provider"
import { usePathname } from "next/navigation"
import { Suspense } from "react"

export function NavProducts() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible asChild defaultOpen={pathname.includes("/product/")}>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Package />
                <span>Products</span>
              </Link>
            </SidebarMenuButton>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90">
                <ChevronRight />
                <span className="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Suspense>
                <NavProductsContent />
              </Suspense>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavProductsContent() {
  const { featuredProducts } = useSidebarItems()
  const pathname = usePathname()

  return (
    <SidebarMenuSub>
      <SidebarGroupLabel>The 5 best-selling</SidebarGroupLabel>
      {featuredProducts.slice(0, 5).map((product) => {
        const href = `/product/${product.slug}`
        return (
          <SidebarMenuSubItem key={product.id}>
            <SidebarMenuSubButton isActive={pathname === href} asChild>
              <Link href={href}>
                <span>{product.name}</span>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        )
      })}
    </SidebarMenuSub>
  )
}
