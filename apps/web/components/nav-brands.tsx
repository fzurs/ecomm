"use client"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import * as React from "react"
import { useSidebarItems } from "./sidebar-items-provider"

export function NavBrands() {
  const { brands } = useSidebarItems()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Brands</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {brands.map((brand) => (
            <SidebarMenuItem key={brand.id}>
              <SidebarMenuButton>{brand.name}</SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
